import {MethodValidationError} from "../../../consts/systems";
import {BaseTableAttributes} from "../BaseTableAttributes";

export interface ProfileTableAttributesIF {
    uid: string
    nickName: string
    iconImagePath: string
}

export class ProfileTableAttributes extends BaseTableAttributes {
    public uid: string
    public nickName: string
    public iconImagePath: string

    private constructor(record: Record<string, any>) {
        super();
        this.uid = record.uid ?? null;
        this.nickName = record.nickName ?? null;
        this.iconImagePath = record.iconImagePath ?? null;
    }

    public static createInstance(record: Record<string, any>): ProfileTableAttributes {
        const userAttributes: ProfileTableAttributesIF = {
            uid: record.uid ?? null,
            nickName: record.nickName ?? null,
            iconImagePath: record.iconImagePath ?? null
        }
        return new ProfileTableAttributes(userAttributes);
    }


    public isEmpty(key: string): boolean {
        switch (key) {
            case "uid":
                return this.uid === null;

            case"nickName":
                return this.nickName === null;

            case "iconImagePath":
                return this.iconImagePath === null;

            default:
                throw new Error(MethodValidationError.BAD_INPUT);
        }
    }
}