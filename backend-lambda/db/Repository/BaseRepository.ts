import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    ScanCommand,
    UpdateCommandInput,
    ScanCommandInput,
    UpdateCommand,
    PutCommand,
    GetCommand,
    GetCommandInput,
    PutCommandInput,
} from "@aws-sdk/lib-dynamodb";
import {ENVIRONMENT} from "../../consts/systems";
import {RepositoryIF} from "./RepositoryIF";

interface DynamoDBTableIF {
    tableName: string
    pKey: string
    sKey?: string
}

/**
 * DB操作の抽象クラス
 */
export abstract class BaseRepository implements RepositoryIF {
    protected client = new DynamoDBClient({region: ENVIRONMENT.region});
    protected docClient = DynamoDBDocumentClient.from(this.client);

    protected constructor(protected readonly tableInfo: DynamoDBTableIF) {
    }

    /**
     * 汎用的なスキャンメソッド
     * @param tableName
     * @private
     */
    private async scanTable(tableName: string): Promise<Record<string, any>[] | undefined> {
        const scanParams: ScanCommandInput = {
            TableName: tableName,
        };
        const scanCommand = new ScanCommand(scanParams);
        const scanResult = await this.docClient.send(scanCommand);
        return scanResult.Items;
    }


    /**
     * 新しいIDを生成するメソッド
     * @param items
     * @private
     */
    private getNewIncrementId(items: any[]): number {
        // ID発番ロジック（例として最大ID + 1を返す）
        const ids = items.map(item => parseInt(item.userId, 10));
        return Math.max(...ids) + 1;
    }

    /**
     * データを作成するメソッド
     * @param item
     */
    public async create(item: { [key: string]: any }): Promise<any> {
        const putParams: PutCommandInput = {
            TableName: this.tableInfo.tableName,
            Item: item,
        };
        const putCommand = new PutCommand(putParams);
        return await this.docClient.send(putCommand);
    }

    /**
     * データを読み取る
     * @param key
     */
    public async read(key: { [key: string]: any }): Promise<any> {
        const getParams: GetCommandInput = {
            TableName: this.tableInfo.tableName,
            Key: key,
        };
        const getCommand = new GetCommand(getParams);
        const getResult = await this.docClient.send(getCommand);
        return getResult.Item;
    }

    /**
     * データを更新する
     * @param key
     * @param attributeValues
     */
    public async update(key: { [key: string]: any }, attributeValues: { [key: string]: any }): Promise<any> {
        const updateParams: UpdateCommandInput = {
            TableName: this.tableInfo.tableName,
            Key: key,
            UpdateExpression: this.createUpdateExpression(attributeValues),
            ExpressionAttributeValues: this.createExpressionAttributeValues(attributeValues),
            ReturnValues: "ALL_NEW",
        };
        const updateCommand = new UpdateCommand(updateParams);
        return await this.docClient.send(updateCommand);
    }

    /**
     * UpdateExpressionを生成する
     * @param attributeValues
     * @private
     */
    private createUpdateExpression(attributeValues: { [key: string]: any }): string {
        const expressions = Object.keys(attributeValues).map(key => `${key} = :${key}`);
        return `set ${expressions.join(", ")}`;
    }

    /**
     * ExpressionAttributeValuesを生成する
     * @param attributeValues
     * @private
     */
    private createExpressionAttributeValues(attributeValues: { [key: string]: any }): { [key: string]: any } {
        const expressionValues: { [key: string]: any } = {};
        for (const [key, value] of Object.entries(attributeValues)) {
            expressionValues[`:${key}`] = value;
        }
        return expressionValues;
    }
}