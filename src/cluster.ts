import type { ConnectOptions, NodeCallback, } from 'couchbase';
import { fetchApi } from './api';
import awaitTo from './awaitTo';
import { PoolDetails } from './interfaces/pool-details';
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

    getClient() {
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
        const client = this.getClient();
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
}


(async () => {
// test
const cluster = await Cluster.connect('couchbase://localhost', {
    password: "1234567",
    username: "admin"
});

const bucket = cluster.bucket('stq');
const collection = bucket.defaultCollection();

const result = await collection.get('a8a1c1f9-a6fd-40bf-a091-5a25deb28c0b', 
    { project: ["id", "userId"] }
);

console.log("result", result);
})()

