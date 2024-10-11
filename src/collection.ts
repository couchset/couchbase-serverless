import type { GetOptions, UpsertOptions } from "couchbase"
import { fetchApi, ResponseBody } from './api';
import { Scope } from './scope';
import { buildSelectArrayExpr, QueryBuilder } from "./query";
import awaitTo from "./awaitTo";
import { IValuesExpr } from "./query/interface/query.types";

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
        const connStr = this.scope.cluster.__connStr;
        const auth = this.scope.cluster.auth;
        const hostname  = connStr.includes("//") ? new URL(connStr).hostname : connStr;
        const useHttps = hostname.includes("18093");
        const url = `http${!useHttps ? "" : "s"}://${hostname}${!useHttps ? ":8093" : "" }`;
        const client = new fetchApi({
            url,
            username: auth.username,
            password: auth.password
        });
        return client;
    }

    async get(key: string, options: GetOptions = { project: ["*"]}): Promise<any> {
        const scope = this.scope;
        const client = this.getClient();

        const { project } = options;
        // TODO timeout, withExpire, 
        const selectProject = project.map((p) => ({$field: {name: p}}));
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
            throw error;
        }

        if(result.errors) {
            throw result.errors;
        }

        return result.results[0];
    }

    async upsert(key: string, value: any, options?: UpsertOptions): Promise<any> {

        const scope = this.scope;
        const client = this.getClient();

        // TODO timeout, other options 
        const valueItem = { id: key, ...value };
        const valuesExpr: IValuesExpr = { key, value: valueItem };

        if(options?.expiry) {
            valuesExpr.options = {expiration: options.expiry };
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
            throw error;
        }

        if(result.errors) {
            throw result.errors;
        }

        return result.results[0];
    }

    // async replace(key: string, value: any, options?: ReplaceOptions, callback?: NodeCallback<MutationResult>): Promise<MutationResult> {
    //     return new Promise((resolve, reject) => {
    //         super.replace(key, value, options, (err, res) => {
    //             if (err) {
    //                 reject(err);
    //             } else {
    //                 resolve(res);
    //             }
    //         });
    //     });
    // }

    // async remove (key: string, options?: any): Promise<any> {
    //     return new Promise((resolve, reject) => {
    //         super.remove(key, options, (err, res) => {
    //             if (err) {
    //                 reject(err);
    //             } else {
    //                 resolve(res);
    //             }
    //         });
    //     });
    // }


}


