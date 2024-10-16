import type { GetOptions, UpsertOptions, ReplaceOptions, RemoveOptions, NodeCallback } from "couchbase"
import { fetchApi, ResponseBody } from './api';
import { Scope } from './scope';
import { buildSelectArrayExpr, QueryBuilder } from "./query";
import awaitTo from "./awaitTo";
import { IValuesExpr } from "./query/interface/query.types";
import { GetResult, MutationResult } from "./lib/crudoptypes";

export class Collection {

    __scope: Scope;
    __name: string;

    static get DEFAULT_NAME() {
        return '_default';
    }

    get scope(): Scope {
        return this.__scope;
    }

    constructor(scope: Scope, collectionName: string) {
        // super(scope as any, collectionName);
        this.__scope = scope;
        this.__name = collectionName;
    }
    getClient() {
        return this.scope.cluster.getSearchClient();
    }

    async get(key: string, options: GetOptions = { project: ["*"] }, callback?: NodeCallback<GetResult>): Promise<GetResult> {
        const scope = this.scope;
        const client = this.getClient();

        const { project } = options;

        // const hasSelectAll = project.includes("*");
        // TODO timeout,
        const selectProject = project.map((p) => ({ $field: { name: p } }));
        if(options.withExpiry){
            selectProject.push({$field: {name: "meta().expiration"}});
        };
        selectProject.push({$field: {name: "meta().cas"}});
        const select = buildSelectArrayExpr(selectProject);
        const query = new QueryBuilder({ select }, scope.bucket.name);
        query.where({ id: key }).limit(1);

        const statement = query.build();

        const [result, error] = await awaitTo<ResponseBody<any>>(client.call<ResponseBody<any>>({
            method: 'POST',
            path: `/query/service`,
            body: {
                statement
            }
        }));

        if (error) {
            if (callback) {
                callback(error, null);
            } else {
                throw error;
            }
        }

        if (result.errors) {
            if (callback) {
                const error = new Error(result.errors[0].code + " " +result.errors[0].msg , )
                callback(error, null);
            } else {
                throw result.errors;
            }
        }

        const results = result.results && result.results[0];
        const content = results && results[scope.bucket.name]? results[scope.bucket.name] : results; //hasSelectAll? result.results[0] : result.results[0][scope.bucket.name];

        // TODO content by project fields
        const {cas, expiration, ...restOfContent} = content || {};
        const response = new GetResult({
            cas: cas,
            content: restOfContent,
            expiryTime: expiration,
        });

        if(callback) {
            callback(null, response);
        }
        return response;
    }

    async upsert(key: string, value: any, options?: UpsertOptions, callback?: NodeCallback<MutationResult>): Promise<MutationResult> {

        const scope = this.scope;
        const client = this.getClient();

        // TODO timeout, other options 
        const valueItem = { id: key, ...value };
        const valuesExpr: IValuesExpr = { key, value: valueItem };

        if (options?.expiry) {
            valuesExpr.options = { expiration: options.expiry };
        }

        const query = new QueryBuilder({}, scope.bucket.name);
        query.upsert().values([valuesExpr]);

        const statement = query.build();

        const [result, error] = await awaitTo<ResponseBody<any>>(client.call<ResponseBody<any>>({
            method: 'POST',
            path: `/query/service`,
            body: {
                statement
            }
        }));

        if (error) {
            if (callback) {
                callback(error, null);
            } else {
                throw error;
            }
        }

        if (result.errors) {
            if (callback) {
                const error = new Error(result.errors[0].code + " " +result.errors[0].msg , )
                callback(error, null);
            } else {
                throw result.errors;
            }
        }

        const content = result.results[0];

        // TODO content by project fields
        const {cas, expiration, ...restOfContent} = content;
        const response = new MutationResult({
            cas: cas,
            content: restOfContent,
        });

        if(callback) {
            callback(null, response);
        }
        return response;
    }

    async replace(key: string, value: any, options?: ReplaceOptions, callback?: NodeCallback<MutationResult>): Promise<MutationResult> {
        return this.upsert(key, value, options, callback);
    }

    async remove(key: string | string[], options?: RemoveOptions, callback?: NodeCallback<MutationResult>): Promise<MutationResult> {
        const scope = this.scope;
        const client = this.getClient();

        // TODO timeout, other options 
        const query = new QueryBuilder({}, scope.bucket.name);
        query.remove(key);

        const statement = query.build();

        const [result, error] = await awaitTo<ResponseBody<any>>(client.call<ResponseBody<any>>({
            method: 'POST',
            path: `/query/service`,
            body: {
                statement
            }
        }));

        if (error) {
            if (callback) {
                callback(error, null);
            } else {
                throw error;
            }
        }

        if (result.errors) {
            if (callback) {
                const error = new Error(result.errors[0].code + " " +result.errors[0].msg , )
                callback(error, null);
            } else {
                throw result.errors;
            }
        }

        const content = result.results[0];

        // TODO content by project fields
        const {cas, expiration, ...restOfContent} = content;
        const response = new MutationResult({
            cas: cas,
            content: restOfContent,
        });

        if(callback) {
            callback(null, response);
        }
        return response;

    }


}


