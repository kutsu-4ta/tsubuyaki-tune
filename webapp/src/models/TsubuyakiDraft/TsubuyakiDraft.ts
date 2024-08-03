import {TsubuyakiDraftIF, TsubuyakiDraftInfoIF, TsubuyakiDraftMetaInfoIF} from "./TsubuyakiDraftIF";
import ImagePath from "../data/ImagePath";
import Mention from "../data/Mention";
import {hashTagString} from "../data/types";
import axios from "axios";
import {authenticationState} from "../../atoms/AuthenticationState";

export interface TsubuyakiDraftArgumentIF {
    sentence: string
    hashTagStringList: hashTagString[]
    imageList: ImagePath[]
    mentionList: Mention[]
    parentTsubuyakiId: string
}

/**
 * Tsubuyaki下書きモデル
 */
export class TsubuyakiDraft implements TsubuyakiDraftIF {
    /**
     * コンストラクタ
     * @param tsubuyakiDraftInfo
     * @param tsubuyakiDraftMetaInfo
     */
    private constructor(
        readonly tsubuyakiDraftInfo: TsubuyakiDraftInfoIF,
        readonly tsubuyakiDraftMetaInfo: TsubuyakiDraftMetaInfoIF
    ) {
    }

    /**
     * ファクトリメソッド
     * @param argument
     */
    public static createTsubuyakiDraftInstance(argument: TsubuyakiDraftArgumentIF
    ): TsubuyakiDraft {

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

        const tsubuyakiDraftInfo: TsubuyakiDraftInfoIF = {
            sentence: argument.sentence,
            hashTagList: argument.hashTagStringList,
            mentionList: argument.mentionList,
            imagePathList: argument.imageList,
        };

        const tsubuyakiDraftMetaInfo: TsubuyakiDraftMetaInfoIF = {
            parentTsubuyakiId: argument.parentTsubuyakiId,
        }

        return new TsubuyakiDraft(tsubuyakiDraftInfo, tsubuyakiDraftMetaInfo);
    }

    /**
     * 投稿する
     */
    public async postAsTsubuyaki(accessToken:string): Promise<any> {
        const endPoint = process.env.REACT_APP_ADD_TSUBUYAKI as string;

        const data = {
            sentence: this.tsubuyakiDraftInfo.sentence,
            mentionList: this.tsubuyakiDraftInfo.mentionList,
            imagePathList: this.tsubuyakiDraftInfo.imagePathList,
            hashTagListString: this.tsubuyakiDraftInfo.hashTagList,
            parentTsubuyakiId: this.tsubuyakiDraftMetaInfo.parentTsubuyakiId
        };

        console.log('===============');
        console.log(accessToken);
        console.log('===============');

        const axiosInstance = axios.create({
            headers: {
                'Authorization': accessToken,
                'x-api-key': '1yIDLcQTj28kU0fpfZFdCaZoi4dCoEgC8hLh1duf'
            }
        });

        return await axiosInstance.post(endPoint, data)
    }

    /**
     * 下書きに保存する
     */
    public saveAsDraft():void {
        console.log('下書きに保存する');
    }

}