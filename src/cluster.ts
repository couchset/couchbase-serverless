import { Bucket as CBBucket, Cluster as CBCluster, Scope as CbScope, Collection as CBCollection, ConnectOptions, MutationResult, NodeCallback, ReplaceOptions } from 'couchbase';

export class Scope {

    __bucket: Bucket;
    __name: string;

    static get DEFAULT_NAME() {
        return '_default';
    }

    get bucket(): Bucket {
        return this.__bucket;
    }

    get name(): string {
        return this.__name;
    }
    
    get cluster(): Cluster {
        return this.bucket.cluster;
    }

    constructor(bucket: Bucket, scopeName: string) {
        // super(bucket as any, scopeName);
        this.__bucket = bucket;
        this.__name = scopeName;
    }

    collection(collectionName: string): Collection {
        return new Collection(this, collectionName);
    }

}
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



    async get(key: string, options?: any): Promise<any> {
        const scope = this.scope;
        console.log("got scope.cluster.auth", scope.cluster.auth)
        // return new Promise((resolve, reject) => {
        //     super.get(key, options, (err, res) => {
        //         if (err) {
        //             reject(err);
        //         } else {
        //             resolve(res);
        //         }
        //     });
        // });
    }

    // async upsert(key: string, value: any, options?: any): Promise<any> {
    //     return new Promise((resolve, reject) => {
    //         super.upsert(key, value, options, (err, res) => {
    //             if (err) {
    //                 reject(err);
    //             } else {
    //                 resolve(res);
    //             }
    //         });
    //     });
    // }

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
export class Bucket {
    __cluster: Cluster;
    __name: string;
    constructor(cluster: Cluster, bucketName: string) {
        // super(cluster, bucketName);
        this.__cluster = cluster as unknown as Cluster;
        this.__name = bucketName;
    }

    get cluster(): Cluster {
        return this.__cluster;
    }

    scope(scopeName: string): Scope {
        return new Scope(this, scopeName);
    }

    defaultScope(): Scope {
        return this.scope(Scope.DEFAULT_NAME);
    }

    collection(collectionName: string): Collection {
        const scope = this.defaultScope();
        return scope.collection(collectionName);
    }

    defaultCollection(): Collection {
        return this.collection(Collection.DEFAULT_NAME);
    }


};

export default class Cluster {
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

    async __connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            resolve();
        });
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
    password: "some password",
    username: "some username"
});

const bucket = cluster.bucket('default');
const collection = bucket.defaultCollection();

const result = await collection.get('test-key');

})()

