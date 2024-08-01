import {TsubuyakiTableIF} from "./TsubuyakiTableIF";
import {Tsubuyaki, TsubuyakiArgumentIF} from "../Tsubuyaki/Tsubuyaki";
import axios, {AxiosResponse} from "axios";
import {dateTimeString, hashTagString} from "../data/types";
import Mention from "../data/Mention";
import ImagePath from "../data/ImagePath";

// バックエンドと揃えている
export interface TsubuyakiListItem {
    sentence: string
    tsubuyakiUserName: string
    tsubuyakiId: string
    hashTagStringList: hashTagString[];
    imageList: ImagePath[];
    mentionList: Mention[];
    dateTimeString: dateTimeString
    parentTsubuyakiId: string
    userIconImagePath: string
    favoriteCount: number
    repostCount: number
}

export class TsubuyakiTable implements TsubuyakiTableIF {
    constructor(public tsubuyakiList: Tsubuyaki[]) {
    }

    public static initTsubuyakiTable(): TsubuyakiTable {
        return new TsubuyakiTable([]);
    }

    /**
     * Tsubuyakiリストを取得する
     * @param props
     */
    public async fetchTsubuyakiList(props: { accessToken: string, uid: string }): Promise<{ updateCount: number } | void> {
        // つふやきを取得する
        const endPoint = process.env.REACT_APP_FETCH_TSUBUYAKI as string;
        const axiosInstance = axios.create({
            headers: {
                'Authorization': props.accessToken,
                'x-api-key': '1yIDLcQTj28kU0fpfZFdCaZoi4dCoEgC8hLh1duf'
            }
        });

        await axiosInstance.get(`${endPoint}?chunk=20`).then((response) => {
            console.log(response);
            const updateCount = response.data.tsubuyakiList.length;
            this.tsubuyakiList = this.createdTsubuyakiListByAPIResponse(response);

            console.log('==========================');
            console.log(this.tsubuyakiList);

            return {updateCount: updateCount};
        }).then((error) => {
            console.log(error);
        });
    }

    private createdTsubuyakiListByAPIResponse(response: AxiosResponse): Tsubuyaki[] {
        const tsubuyakiList: TsubuyakiArgumentIF[] = response.data.tsubuyakiList;

        return tsubuyakiList.map((tsubuyakiListItem: TsubuyakiListItem, i: number) => {

            console.log(tsubuyakiList);

            return Tsubuyaki.createTsubuyakiInstance({
                sentence: tsubuyakiList[i].sentence,
                tsubuyakiUserName: tsubuyakiList[i].tsubuyakiUserName,
                userIconImagePath: tsubuyakiList[i].userIconImagePath,
                tsubuyakiId: tsubuyakiList[i].tsubuyakiId,
                hashTagStringList: tsubuyakiList[i].hashTagStringList,
                imageList: tsubuyakiList[i].imageList,
                mentionList: tsubuyakiList[i].mentionList,
                dateTimeString: tsubuyakiList[i].dateTimeString,
                parentTsubuyakiId: tsubuyakiList[i].parentTsubuyakiId,
                favoriteCount: tsubuyakiList[i].favoriteCount,
                repostCount: tsubuyakiList[i].repostCount,
            })
        });
    }

    public dev_fetchTsubuyakiList2(): void {
        console.log('fetchTsubuyakiList');
        this.tsubuyakiList = [
            Tsubuyaki.createTsubuyakiInstance({
                sentence:'ギター弾きてぇー。',
                tsubuyakiUserName: 'aaaaaaaaaaaa',
                userIconImagePath: '',
                tsubuyakiId:'2',
                hashTagStringList: [],
                imageList:[],
                mentionList:[],
                dateTimeString: '2024-07-18-14:23',
                parentTsubuyakiId: '',
                favoriteCount: 10,
                repostCount: 0,
            }),
            Tsubuyaki.createTsubuyakiInstance({
                sentence:'3DCG作ってるけど、モデリングからつまいずいてる。',
                tsubuyakiUserName: 'aaaaaaaaaaaa',
                userIconImagePath: '',
                tsubuyakiId:'3',
                hashTagStringList: [],
                imageList:[],
                mentionList:[],
                dateTimeString: '2024-07-18-14:23',
                parentTsubuyakiId: '',
                favoriteCount: 10,
                repostCount: 0,
            }),
            Tsubuyaki.createTsubuyakiInstance({
                sentence: '社内システム開発がめんどくさい。なんかいい方法ないかな。',
                tsubuyakiUserName: 'aaaaaaaaaaaa',
                userIconImagePath: '',
                tsubuyakiId:'1',
                hashTagStringList: [],
                imageList:[],
                mentionList:[],
                dateTimeString: '2024-07-18-14:23',
                parentTsubuyakiId: '',
                favoriteCount: 10,
                repostCount: 0,
            })
            ];
    }

    public getTsubuyakiList(): Tsubuyaki[] {
        return this.tsubuyakiList;
    }
}