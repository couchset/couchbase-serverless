

export interface ResponseBody<T> {
    requestID: string;
    signature: {
        name: string;
    };
    results?: T;

    errors?: Array<{ code: number; msg: string; retry?: boolean }>;

    status: string;
    metrics: {
        elapsedTime: string;
        executionTime: string;
        resultCount: number;
        resultSize: number;
        serviceLoad: number;
        errorCount?: number;
        mutationCount?: number;
        warningCount?: number;
    };
}

export interface RequestBody {
    statement: string;
    [x: string]: any;
};

export interface FetchApi {
    url: string;
    username: string;
    password: string;
}

interface CallApi {
    body?: RequestBody;
    path: string;
    method: string;
};


export class fetchApi {
    private url: string;
    private username: string;
    private password: string;

    constructor(args: FetchApi) {
        this.url = args.url;
        this.username = args.username;
        this.password = args.password
    }

    public async call<T>(args: CallApi): Promise<T> {

        try {

            const { path, body, method } = args;
            const headers = new Headers();
            headers.append('Content-Type', 'application/json');
            headers.append('Accept', 'application/json');
            headers.set('Authorization', 'Basic ' + btoa(this.username + ":" + this.password));

            const fetchRequest = new Request(
                `${this.url}${path}`,
                {
                    headers: headers,
                    method: method,
                    ...(method === 'POST' ? { body: JSON.stringify(body) } : {})
                }
            );

            
            const api = await fetch(fetchRequest);

            if (api.status === 200) {
                // throw new Error("Error fetching data");
                const data: T = await api.json();
                return data;
            }

            switch (api.status) {
                case 400:
                    throw new Error("Bad Request");
                case 401:
                    throw new Error("Unauthorized");
                case 403:
                    throw new Error("Forbidden");
                case 404:
                    throw new Error("Not Found");
                case 405:
                    throw new Error("Method Not Allowed");
                case 500:
                    throw new Error("Internal Server Error");
                default:
                    throw new Error("Error fetching data");
            }
        }
        catch (error) {
            console.log("error api", error);
            throw error;
        }
    }
}