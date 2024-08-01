import {MethodValidationError} from "../../../consts/systems";
import {BaseTableAttributes} from "../BaseTableAttributes";
import {hashTagString} from "../../../models/data/types";
import Mention from "../../../models/data/Mention";
import ImagePath from "../../../models/data/ImagePath";

export interface TsubuyakiTableAttributesIF {
    tsubuyakiId: string
    parentTsubuyakiId: string
    ownerUserUid: string
    sentence: string
    dateTimeString: string
    imageList: string
    mentionList: string
    hashTagStringList: string
}

export class TsubuyakiTableAttributes extends BaseTableAttributes {
    public tsubuyakiId: string
    public parentTsubuyakiId: string
    public ownerUserUid: string
    public sentence: string
    public dateTimeString: string
    public imageList: ImagePath[]
    public mentionList: Mention[]
    public hashTagStringList: hashTagString[]

    private constructor(record: Record<string, any>) {
        super();
        this.tsubuyakiId = record.tsubuyakiId ?? null;
        this.parentTsubuyakiId = record.parentTsubuyakiId ?? null;
        this.ownerUserUid = record.ownerUserUid ?? null;
        this.sentence = record.sentence ?? null;
        this.dateTimeString = record.dateTimeString ?? null;
        this.imageList = record.imageList ?? null;
        this.mentionList = record.mentionList ?? null;
        this.hashTagStringList = record.hashTagStringList ?? null;
    }

    public static createInstance(record: Record<string, any>): TsubuyakiTableAttributes {
        const tsubuyakiAttributes: TsubuyakiTableAttributesIF = {
            tsubuyakiId:record.tsubuyakiId,
            parentTsubuyakiId:record.parentTsubuyakiId,
            ownerUserUid:record.ownerUserUid,
            sentence:record.sentence,
            dateTimeString:record.dateTimeString,
            imageList:record.imageList,
            mentionList:record.mentionList,
            hashTagStringList:record.hashTagStringList,
        }
        return new TsubuyakiTableAttributes(tsubuyakiAttributes);
    }


    public isEmpty(key: string): boolean {
        switch (key) {
            case "tsubuyakiId":
                return this.tsubuyakiId === null;

            case "parentTsubuyakiId":
                return this.parentTsubuyakiId === null;

            case"ownerUserUid":
                return this.ownerUserUid === null;

            case "sentence":
                return this.sentence === null;

            case "dateTimeString":
                return this.dateTimeString === null;

            case "imageList":
                return this.imageList === null;

            case"mentionList":
                return this.mentionList === null;

            case "hashTagStringList":
                return this.hashTagStringList === null;

            default:
                throw new Error(MethodValidationError.BAD_INPUT);
        }
    }
}