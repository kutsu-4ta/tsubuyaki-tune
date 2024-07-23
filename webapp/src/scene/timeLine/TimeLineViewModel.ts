import TimeLIneViewModelIF from "./TimeLIneViewModelIF";
import {TsubuyakiTable} from "../../models/TsubuyakiTable/TsubuyakiTable";
import {TsubuyakiDraft, TsubuyakiDraftArgumentIF} from "../../models/TsubuyakiDraft/TsubuyakiDraft";
import ImagePath from "../../models/data/ImagePath";
import Mention from "../../models/data/Mention";
import Authentication, {AuthenticationArgumentIF} from "../../models/Authentication/Authentication";
import axios from "axios";

export class TimeLineViewModel implements TimeLIneViewModelIF {
    protected authState:Authentication = Authentication.initAuthentication();
    public tsubuyakiTable: TsubuyakiTable = TsubuyakiTable.initTsubuyakiTable();
    constructor(
    ) {
        console.log('====================TimeLineViewModel_called====================');
    }

    /**
     * セットアップ処理
     * @param argument
     */
    setUp(argument: { authentication: AuthenticationArgumentIF }): void {
        console.log('====================TimeLineViewModel_setup====================');
        this.authState.setAuthentication(argument.authentication);
        this.tsubuyakiTable.fetchTsubuyakiList();
        console.log('====================TimeLineViewModel_setup_end====================');
    }

    /**
     * クリーンアップ処理
     */
    cleanUp():void {
        console.log('TimeLineViewModel');
        console.log('cleanUp');
    }


    /**
     * Tsubuyakiを投稿する
     */
    async addTsubuyaki(): Promise<any> {
        // 下書きを作成する
        const draftArgument = this._devCreateDraft();
        const draft = TsubuyakiDraft.createTsubuyakiDraftInstance(draftArgument);
        draft.postAsTsubuyaki();
        console.log(draft);

        //TODO: 定数
        const endPoint = 'http://localhost:8000/api/vi/profile/tsubuyaki/add';

        console.log(draft.tsubuyakiDraftInfo.mentionList);
        const data = {
            mentionList: draft.tsubuyakiDraftInfo.mentionList,
            sentence: draft.tsubuyakiDraftInfo.sentence,
            imagePathList: draft.tsubuyakiDraftInfo.imagePathList,
            hashTagListString: draft.tsubuyakiDraftInfo.hashTagList,
            parentTsubuyakiId: draft.tsubuyakiDraftMetaInfo.parentTsubuyakiId
        };

        const axiosInstance = axios.create({
            withCredentials: true,
            withXSRFToken: true,
        });

        // const CSRF_ROOT = 'http://localhost:8000/sanctum/csrf-cookie';
        // void axios.get(CSRF_ROOT,{withCredentials: true, withXSRFToken: true}).then((res) => {
            void axiosInstance.post(endPoint, data).then((response) => {
                console.log('成功', response);
                return response;
            }).catch((error) => {
                console.log('失敗', error);
                return error;
            });
        // }).catch((error) => {
        //     console.log(error)
        // });
    };


    /**
     * 下書きを作成するための開発用コード
     * @private
     */
    private _devCreateDraft(): TsubuyakiDraftArgumentIF {
        const imagePathList = [
            ImagePath.create({alt:'sample1',path:'http://hogehoge-sample1.hoge.com'}),
            ImagePath.create({alt:'sample2',path:'http://hogehoge-sample2.hoge.com'})
        ];

        const mentionList = [
            Mention.create({idCategory: 'user', idValue:'2'}),
            Mention.create({idCategory: 'user', idValue:'3'})
        ];

        return {
            sentence: 'hello world!',
            hashTagStringList: ['#abc', '#efg', '#hij'],
            imageList: imagePathList,
            mentionList: mentionList,
            parentTsubuyakiId:'',
        }
    }

    /**
     * TODO:実装
     */
    loadTimeLine(): void {
        console.log('loadTimeLine');
        this.tsubuyakiTable.dev_fetchTsubuyakiList2();
    }

    /**
     * TODO:実装
     */
    reloadTimeLine(): void {
    }

    /**
     * TODO:実装
     */
    shareTsubuyaki(): void {
    }

    /**
     * TODO:実装
     */
    toggleFavorite(): void {
    }

    /**
     * TODO:実装
     */
    toggleRepost(): void {
    }
}