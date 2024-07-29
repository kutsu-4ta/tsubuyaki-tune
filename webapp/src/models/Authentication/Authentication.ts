export interface AuthenticationArgumentIF {
    accessToken: string
    uid: string
    email: string
}

export default class Authentication {
    private constructor(
        protected accessToken: string,
        protected uid: string,
        protected email: string,
    ) {
    }

    public static initAuthentication(): Authentication {
        return new Authentication('', '', '');
    }

    public setAuthentication(argument: AuthenticationArgumentIF): void {
        this.accessToken = argument.accessToken;
        this.uid = argument.uid;
        this.email = argument.email;
    }

    public getUid(): string {
        return this.uid
    }

    public getEmail(): string {
        return this.email
    }

    public getAccessToken(): string {
        return this.accessToken
    }
}