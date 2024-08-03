import {TsubuyakiIF, TsubuyakiInfoIF, TsubuyakiMetaInfoIF} from "./TsubuyakiIF";
import ImagePath from "../data/ImagePath";
import Mention from "../data/Mention";
import {dateTimeString, hashTagString} from "../data/types";

export interface TsubuyakiArgumentIF {
    sentence: string
    tsubuyakiUserName: string
    tsubuyakiId: string
    hashTagStringList: hashTagString[]
    imageList: ImagePath[]
    mentionList: Mention[]
    createdAt: dateTimeString
    parentTsubuyakiId: string
    userIconImagePath: string
    favoriteCount: number
    repostCount: number
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
    constructor(
        readonly tsubuyakiInfo: TsubuyakiInfoIF,
        readonly tsubuyakiMetaInfo: TsubuyakiMetaInfoIF
    ) {
    }

    /**
     * ファクトリメソッド
     */
    public static createTsubuyakiInstance(argument:TsubuyakiArgumentIF
    ):Tsubuyaki {

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

        const tsubuyakiMetaInfo:TsubuyakiMetaInfoIF = {
            tsubuyakiUserName: argument.tsubuyakiUserName,
            userIconImagePath: argument.userIconImagePath,
            favoriteCount: argument.favoriteCount,
            repostCount: argument.repostCount,
            tsubuyakiId: argument.tsubuyakiId,
            createdAt: argument.createdAt,
            parentTsubuyakiId: argument.parentTsubuyakiId,
        }

        return new Tsubuyaki(tsubuyakiInfo, tsubuyakiMetaInfo);
    }

    /**
     * TODO:実装
     */
    public toggleFavorite() {
    }

    /**
     * TODO:実装
     */
    public toggleRepost() {
    }

    /**
     * TODO:実装
     */
    public shareTsubuyaki() {
    }
}