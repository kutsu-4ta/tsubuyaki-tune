import ImagePath from "./data/ImagePath";
import Mention from "./data/Mention";
import {dateTimeString, hashTagString} from "./data/types";
import {TsubuyakiRepository} from "../db/Repository/TsubuyakiTable/TsubuyakiRepository";
import {TsubuyakiTableAttributes} from "../db/Repository/TsubuyakiTable/TsubuyakiTableAttributes";

export interface TsubuyakiIF {
    tsubuyakiInfo: TsubuyakiInfoIF
    tsubuyakiMetaInfo: TsubuyakiMetaInfoIF
}

export interface TsubuyakiInfoIF {
    sentence: string
    imagePathList: ImagePath[]
    hashTagList: hashTagString[]
    mentionList: Mention[]
}

export interface TsubuyakiMetaInfoIF {
    tsubuyakiId: string
    parentTsubuyakiId: string
    ownerUserUid: string
    dateTimeString: dateTimeString
}

/**
 * Tsubuyakiモデル
 */
export class Tsubuyaki implements TsubuyakiIF {
    /**
     * コンストラクタ
     * @param tsubuyakiInfo
     * @param tsubuyakiMetaInfo
     */
    private constructor(
        readonly tsubuyakiInfo: TsubuyakiInfoIF,
        readonly tsubuyakiMetaInfo: TsubuyakiMetaInfoIF
    ) {
    }

    /**
     * ファクトリメソッド
     */
    static createTsubuyakiInstance(argument: {
                                              tsubuyakiId: string
                                              ownerUserUid: string
                                              parentTsubuyakiId: string
                                              sentence: string
                                              hashTagStringList: hashTagString[]
                                              imageList: ImagePath[]
                                              mentionList: Mention[]
                                              dateTimeString: dateTimeString
                                          }
    ): Tsubuyaki {

        if (argument.hashTagStringList === null) {
            argument.hashTagStringList = [];
        }

        if (argument.imageList === null) {
            argument.imageList = [];
        }

        if (argument.mentionList === null) {
            argument.mentionList = [];
        }

        if (argument.sentence === '') {
            console.log('error')
        }

        const tsubuyakiInfo: TsubuyakiInfoIF = {
            sentence: argument.sentence,
            hashTagList: argument.hashTagStringList,
            mentionList: argument.mentionList,
            imagePathList: argument.imageList,
        };

        const tsubuyakiMetaInfo: TsubuyakiMetaInfoIF = {
            tsubuyakiId: argument.tsubuyakiId,
            parentTsubuyakiId: argument.parentTsubuyakiId,
            ownerUserUid: argument.ownerUserUid,
            dateTimeString: argument.dateTimeString,
        }

        return new Tsubuyaki(tsubuyakiInfo, tsubuyakiMetaInfo);
    }

    static async createTsubuyaki(props:{
                               parentTsubuyakiId: string,
                               ownerUserUid: string,
                               sentence: string,
                               dateTimeString: string,
                               imageList: ImagePath[],
                               mentionList: Mention[],
                               hashTagStringList: hashTagString
                           }):Promise<TsubuyakiTableAttributes> {
        const repository = new TsubuyakiRepository();
        const newTsubuyaki = await repository.createTsubuyaki(
            {
                parentTsubuyakiId: props.parentTsubuyakiId,
                ownerUserUid: props.ownerUserUid,
                sentence: props.sentence,
                dateTimeString: props.dateTimeString,
                imageList: props.imageList,
                mentionList: props.mentionList,
                hashTagStringList: props.hashTagStringList
            }
        );
        
        return newTsubuyaki;
    }
}