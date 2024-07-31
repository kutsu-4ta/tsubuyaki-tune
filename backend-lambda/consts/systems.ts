export enum StatusCodes {
    SUCCESS = 200,
    BAD_REQUEST = 400,
    INTERNAL_SERVER_ERROR = 500,
}

/**
 * 汎用的なレスポンスエラーメッセージ
 */
export enum Messages {
    SUCCESS = "Success",
    BAD_REQUEST = "Bad Request",
    INTERNAL_SERVER_ERROR = "Internal Server Error",
    DB_QUERY_ERROR = "Operation of DataBase Error"
}

/**
 * 汎用的なエラーメッセージ
 */
export enum ErrorMessages {
    UNAUTHORIZED = "User is Unauthorized",
    BAD_INPUT = "Bad Input for Class",
    CRUD_CREATE = "Failed to Create",
    CRUD_READ = "Failed to Read",
    CRUD_UPDATE = "Failed to Update",
    NOT_EXIST_PROFILE = "Profile is Not Exits",
}

/**
 * メソッドに不正な引数が渡された際に発生するエラー TODO: 仮
 */
export enum MethodValidationError {
    BAD_ARRAY = "Array is Wrong",
    BAD_INPUT = "Bad Input for Method"
}

/**
 * クラスに不正な引数が渡された際に発生するエラー TODO: 仮
 */
export enum ClassValidationError {
    BAD_ARRAY = "Array is Wrong"
}

/**
 * 環境変数
 */
export class ENVIRONMENT {
    static clientSecret: string = process.env.ClientSecret as string;
    static redirectUrl: string = process.env.RedirectUri as string;
    static region: string = process.env.Region as string;
    static authTableName: string = process.env.AuthTableName as string;
    static profileTableName: string = process.env.ProfileTableName as string;
    static tsubuyakiTableName: string = process.env.TsubuyakiTableName as string;
}