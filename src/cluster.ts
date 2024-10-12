import type { ConnectOptions, NodeCallback, } from 'couchbase';
import { fetchApi, ResponseBody } from './api';
import awaitTo from './awaitTo';
import { PoolDetails } from './interfaces/pool-details';
import {QueryOptions, QueryResult } from './lib/querytypes';
import { Bucket } from './bucket';

export class Cluster {
    __connStr: string;

    __auth: {
        username: string;
        password: string;
    } = {
        username: '',
        password: '',
    };

    get auth() {
        return this.__auth;
    }
    constructor(connStr: string, options?: ConnectOptions) {
        this.__connStr = connStr;

        if (options?.username || options?.password) {
            this.__auth = {
                username: options.username || '',
                password: options.password || '',
            };
        }

        return this;
    }

    getSearchClient() {
        const connStr = this.__connStr;
        const auth = this.auth;
        const hostname = connStr.includes("//") ? new URL(connStr).hostname : connStr;
        const useHttps = hostname.includes("18093");
        const url = `http${!useHttps ? "" : "s"}://${hostname}${!useHttps ? ":8093" : ""}`;
        const client = new fetchApi({
            url,
            username: auth.username,
            password: auth.password
        });
        return client;
    }

    getServerClient() {
        const hostname  = this.__connStr.includes("//") ? new URL(this.__connStr).hostname : this.__connStr;
        const url = `http://${hostname}:8091`;
        const client = new fetchApi({
            url,
            username: this.auth.username,
            password: this.auth.password
        });
        return client;
    }

    async __connect(): Promise<PoolDetails> {
        const client = this.getServerClient();
        const [clusterStatus, error] = await awaitTo<PoolDetails>(client.call<PoolDetails>({
            method: 'GET',
            path: '/pools/default'
        }));
        if (error) {
            throw error;
        }
        return clusterStatus;
    }

    static connect(connStr: string, options?: ConnectOptions, callback?: NodeCallback<Cluster>): Promise<Cluster> {
        return new Promise((resolve, reject) => {
            const cluster = new Cluster(connStr, options);
            cluster.__connect().then(() => {
                if (callback) {
                    callback(null, cluster);
                }
                resolve(cluster);
            }).catch((err) => {
                if (callback) {
                    callback(err, null);
                }
                reject(err);
            });
        });
    }

    bucket(bucketName: string): Bucket {
        return new Bucket(this, bucketName);
    }

    async query<TRow = any>(statement: string, options?: QueryOptions, callback?: NodeCallback<QueryResult<TRow>>): Promise<QueryResult<TRow>> {
        // return null as any;
        const client = this.getSearchClient();

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

        const {results, ...restOfMeta} = result;
        const response = new QueryResult<TRow>({
            rows: results,
            meta: {
                ...restOfMeta, 
                requestId: result.requestID,
                metrics: result.metrics as any,
             },
        });

        if(callback) {
            callback(null, response);
        }
        return response;
    }
}

