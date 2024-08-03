/**
 * DBと紐づいたモデル.
 * 他のモジュールはRepositoryを通してしのみDBとの接続を行うこと.
 */
import {UpdateCommand} from "@aws-sdk/lib-dynamodb";
import {BaseRepository} from "../BaseRepository";
import {ENVIRONMENT, Messages} from "../../../consts/systems";
import {DataValidator} from "../../../utility/DataValidator";
import {TsubuyakiTableAttributes, TsubuyakiTableAttributesIF} from "./TsubuyakiTableAttributes";
import ImagePath from "../../../models/data/ImagePath";
import Mention from "../../../models/data/Mention";
import {dateTimeString, hashTagString} from "../../../models/data/types";

export class TsubuyakiRepository extends BaseRepository {
    constructor() {
        super({
            tableName: ENVIRONMENT.tsubuyakiTableName,
            pKey: 'tsubuyakiId',
            attributes: [
                'tsubuyakiId',
                'parentTsubuyakiId',
                'ownerUserUid',
                'sentence',
                'createdAt',
                'imageList',
                'mentionList',
                'hashTagStringList'
            ],
        });
    }

    /**
     * DynamoDBから取得したレコードをTableAttributesとして取得する
     */
    public getAsTableAttributes(): TsubuyakiTableAttributes[] {
        return this.records.map((record: Record<string, any>) => {
            return TsubuyakiTableAttributes.createInstance(record);
        });
    }

    /**
     * レコードの初めの一つをTableAttributesとして取り出す
     */
    public getFirstAsTableAttributes(): TsubuyakiTableAttributes | null {

        // ガード
        if (DataValidator.isEmpty(this.records)) {
            return null;
        }

        return TsubuyakiTableAttributes.createInstance(this.records[0]);
    }

    /**
     * レコードの配列の中から一致するレコードを取得する
     * HACK:本当はDynamoDBの取得で行いたい...
     */
    public filteredByMatchUid(expected: string) {
        this.records = this.records.filter((record) => record.uid === expected);
        return this
    }

    /**
     * つぶやきレコードを新規作成する
     * @param props
     */
    public async createTsubuyaki(
        props: {
            parentTsubuyakiId: string,
            ownerUserUid: string,
            sentence: string,
            createdAt: string,
            imageList: ImagePath[],
            mentionList: Mention[],
            hashTagStringList: hashTagString
        }): Promise<TsubuyakiTableAttributes> {

        // 一意の値を生成
        const newTsubuyakiId = await this.getNewTsubuyakiId();

        const ownerUserId = props.ownerUserUid;
        const imageListJson = JSON.stringify(JSON.stringify(props.imageList))??'';
        const mentionListJson = JSON.stringify(JSON.stringify(props.mentionList))??'';
        const hashTagStringList = JSON.stringify(props.hashTagStringList)??'';

        console.log(newTsubuyakiId);
        console.log(imageListJson);
        console.log(mentionListJson);
        console.log(hashTagStringList);

        //　つぶやき追加
        const updateCommand = new UpdateCommand({
            TableName: this.tableInfo.tableName,
            Key: {
                tsubuyakiId: `${newTsubuyakiId}`
            },
            UpdateExpression: "set parentTsubuyakiId = :parentTsubuyakiId, ownerUserUid = :ownerUserUid, sentence = :sentence, createdAt = :createdAt, imageList = :imageList, mentionList = :mentionList, hashTagStringList = :hashTagStringList",
            ExpressionAttributeValues: {
                ":parentTsubuyakiId": props.parentTsubuyakiId,
                ":ownerUserUid": ownerUserId,
                ":sentence": props.sentence,
                ":createdAt": props.createdAt,
                ":imageList": imageListJson,
                ":mentionList": mentionListJson,
                ":hashTagStringList": hashTagStringList,
            },

            ReturnValues: "ALL_NEW",
        });
        const updateResult = await this.docClient.send(updateCommand);
        console.log(Messages.SUCCESS + "_Update " + this.tableInfo.tableName);
        console.log(updateResult);

        return TsubuyakiTableAttributes.createInstance({
            tsubuyakiId:updateResult.Attributes?.tsubuyakiId,
            parentTsubuyakiId:updateResult.Attributes?.parentTsubuyakiId,
            ownerUserUid:updateResult.Attributes?.ownerUserUid,
            sentence:updateResult.Attributes?.sentence,
            createdAt:updateResult.Attributes?.createdAt,
            imageList:updateResult.Attributes?.imageList,
            mentionList:updateResult.Attributes?.mentionList,
            hashTagStringList:updateResult.Attributes?.hashTagStringList,
        });
    }

    /**
     * 新しいインクリメントIDを発番する　TODO: できれば共通化したい
     * @private
     */
    private async getNewTsubuyakiId(): Promise<number> {
        const all = await this.getAll();
        const allRecords = all.getRecords();

        let newIncrementId = 1;
        if (DataValidator.isEmpty(allRecords)) {
            return newIncrementId;
        }

        for (const item of allRecords) {
            if (newIncrementId < item.tsubuyakiId) {
                newIncrementId = item.tsubuyakiId;
            }
        }
        return Number(newIncrementId) + 1;
    };


}

