import * as https from 'https';

interface PostOptionsIF {
    hostname: string
    port: number|null
    path: string
    headers: {}
}

export class PostRequest {
    public options: PostOptionsIF;
    public data: {};

    constructor(options: PostOptionsIF) {
        this.options = options;
        this.data = {};
    }

    public async post(body: {}): Promise<any> {
        const hostName = this.options.hostname;
        const port = this.options.port;
        const path = this.options.path;
        const headers = this.options.headers;

        const postOptions: https.RequestOptions = {
            hostname: hostName,
            port: port,
            path: path,
            method: 'POST',
            headers: headers
        }
        return await new Promise((resolve, reject) => {
            const request = https.request(postOptions, (response: any) => {
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

            request.write(body);

            request.end();
        });
    }
}