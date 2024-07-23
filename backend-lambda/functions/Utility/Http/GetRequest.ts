import * as https from 'https';

interface GetOptionsIF {
    hostname: string
    path: string
    headers: {}
}

export class GetRequest {
    public options: GetOptionsIF;
    public data: {};

    constructor(options: GetOptionsIF) {
        this.options = options;
        this.data = {};
    }

    public async get(): Promise<any> {
        const hostName = this.options.hostname;
        const path = this.options.path;
        const headers = this.options.headers;

        const getOptions: https.RequestOptions = {
            hostname: hostName,
            path: path,
            method: 'GET',
            headers: headers
        }
        return await new Promise((resolve, reject) => {
            const request = https.request(getOptions, (response: any) => {
                let data = '';
                response.on('data', (chunk: any) => {
                    data += chunk;
                });

                response.on('end', () => {
                    resolve(JSON.parse(data));
                });
            });

            request.on('error', (error: any) => {
                reject(error);
            });

            request.end();
        });
    }
}