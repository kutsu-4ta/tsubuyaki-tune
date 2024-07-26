/**
 * DBと紐づいたモデル.
 * 他のモジュールはRepositoryを通してしのみDBとの接続を行うこと.
 */
import { ScanCommand, UpdateCommand} from "@aws-sdk/lib-dynamodb";
import {BaseRepository} from "./BaseRepository";
import {ENVIRONMENT, ErrorMessages} from "../../consts/systems";

export class UserRepository extends BaseRepository {
    constructor() {
        super({tableName: ENVIRONMENT.authTableName, pKey: 'userId'});
    }

    /**
     * ユーザーレコードを新規作成する
     * @param props
     */
    public async createUser(
        props: {
            email: string
            accessToken: string
        }): Promise<UserTableItemIF> {

        // 一意の値を生成
        const newUserId = await this.getNewUserId();
        // const uid = uuidv4() as string; // TODO: DBでユニークチェックが必要 Lambadaレイヤー作成後に使える
        const uid = 'not_use_this_is_under_construction'+ `${newUserId}`; // TODO:仮

        //　ユーザー作成
        const updateCommand = new UpdateCommand({
            TableName: ENVIRONMENT.authTableName,
            Key: {
                userId: `${newUserId}`
            },
            UpdateExpression: "set accessToken = :accessToken, email = :email, uid = :uid",
            ExpressionAttributeValues: {
                ":accessToken": props.accessToken,
                ":email": props.email,
                ":uid": uid
            },
            ReturnValues: "ALL_NEW",
        });
        const updateResult = await this.docClient.send(updateCommand);
        console.log("updateResult");
        console.log(updateResult);

        // const item:UserTableItemIF = updateResult

        return {
            userId: "aaaa",
            uid: "aaaa",
            email: "aaaaa",
            accessToken: "aaaa"
        }
    }


    /**
     * アクセストークンを更新する
     * @param props
     * @private
     */
    private async updateAccessToken(props: { accessToken: string, userId: string }): Promise<void | Error> {
        try {
            const updateCommand = new UpdateCommand({
                TableName: ENVIRONMENT.authTableName,
                Key: {
                    userId: props.userId
                },
                UpdateExpression: "set accessToken = :accessToken",
                ExpressionAttributeValues: {
                    ":accessToken": props.accessToken,
                },
                ReturnValues: "ALL_NEW",
            });
            await this.docClient.send(updateCommand);
        } catch {
            console.error("updateAccessToken");
            throw new Error(ErrorMessages.CRUD_UPDATE);
        }
    }

    /**
     * 新しいユーザーIDを発番する
     * @private
     */
    private async getNewUserId(): Promise<number> {
        const scanParams = {
            TableName: this.tableInfo.tableName,
        };
        const scanCommand = new ScanCommand(scanParams);
        const scanResult = await this.client.send(scanCommand);

        let newUserId = 1;
        if (scanResult.Count === 0) {
            return newUserId;
        }

        // increment logic
        for (const item of scanResult.Items!) {
            if (newUserId < item.userId) {
                newUserId = item.userId;
            }
        }
        return Number(newUserId) + 1;
    };


}

interface UserTableItemIF {
    userId: string
    uid: string
    email: string
    accessToken: string
}