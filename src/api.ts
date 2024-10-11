

interface ResponseBody<T> {
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

interface RequestBody {
    statement: string;
    [x: string]: any;
};

interface FetchApi {
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
                `${this.url}/${path}`,
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

            // Throw error
            const data: T = await api.json();
            return data;
        }
        catch (error) {
            console.log("error api", error);
            throw error;
        }
    }
}