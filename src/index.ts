import type { ConnectOptions, NodeCallback } from 'couchbase';
import {Cluster} from './cluster';

export * from './cluster';

export function connect(connStr: string, options?: ConnectOptions, callback?: NodeCallback<Cluster>): Promise<Cluster> {
    return Cluster.connect(connStr, options, callback);
}