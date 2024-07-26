export enum StatusCodes {
    SUCCESS = 200,
    BAD_REQUEST = 400,
    INTERNAL_SERVER_ERROR = 500,
}

export enum Messages {
    SUCCESS = "Success",
    BAD_REQUEST = "Bad Request",
    INTERNAL_SERVER_ERROR = "Internal Server Error",
    DB_QUERY_ERROR = "Operation of DataBase Error"
}

export enum ErrorMessages {
    BAD_INPUT = "Bad Input for Class",
    CRUD_CREATE = "Failed to Create",
    CRUD_UPDATE = "Failed to Update",
}

/**
 * 環境変数
 */
export class ENVIRONMENT {
    static clientSecret: string = process.env.ClientSecret as string;
    static redirectUrl: string = process.env.RedirectUri as string;
    static region: string = process.env.Region as string;
    static authTableName: string = process.env.AuthTableName as string;
}