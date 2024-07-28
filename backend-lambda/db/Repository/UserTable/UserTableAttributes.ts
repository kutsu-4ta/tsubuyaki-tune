import {MethodValidationError} from "../../../consts/systems";
import {BaseTableAttributes} from "../BaseTableAttributes";

export interface UserTableAttributesIF {
    userId: string
    uid: string
    email: string
    accessToken: string
}

export class UserTableAttributes extends BaseTableAttributes {
    public userId: string
    public uid: string
    public email: string
    public accessToken: string

    private constructor(record: Record<string, any>) {
        super();
        this.userId = record.userId ?? null;
        this.uid = record.uid ?? null;
        this.email = record.email ?? null;
        this.accessToken = record.accessToken ?? null;
    }

    public static createInstance(record: Record<string, any>): UserTableAttributes {
        const userAttributes: UserTableAttributesIF = {
            userId: record.userId ?? null,
            uid: record.uid ?? null,
            email: record.email ?? null,
            accessToken: record.accessToken ?? null
        }
        return new UserTableAttributes(userAttributes);
    }


    public isEmpty(key: string): boolean {
        switch (key) {
            case "userId":
                return this.userId === null;

            case "uid":
                return this.uid === null;

            case"email":
                return this.email === null;

            case "accessToken":
                return this.accessToken === null;

            default:
                throw new Error(MethodValidationError.BAD_INPUT);
        }
    }
}