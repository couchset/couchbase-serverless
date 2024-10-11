import { Bucket } from "./bucket";
import { Cluster } from "./cluster";
import { Collection } from "./collection";

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


