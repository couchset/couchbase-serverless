import { Cluster } from "./cluster";
import { Collection } from "./collection";
import { Scope } from "./scope";

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

    get name(): string {
        return this.__name;
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


