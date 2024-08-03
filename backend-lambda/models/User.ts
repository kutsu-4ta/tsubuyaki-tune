import {ENVIRONMENT, ErrorMessages, Messages} from "../consts/systems";
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocumentClient, UpdateCommand} from "@aws-sdk/lib-dynamodb";
import {UserRepository} from "../db/Repository/UserTable/UserRepository";
import {Profile} from "./Profile";
import {UserTableAttributes} from "../db/Repository/UserTable/UserTableAttributes";
import {ProfileRepository} from "../db/Repository/ProfileTable/ProfileRepository";
import {DataValidator} from "../utility/DataValidator";
import {ProfileTableAttributes} from "../db/Repository/ProfileTable/ProfileAttributes";

export class User {
    public userRepository: UserRepository = new UserRepository();
    public profile: Profile | null;

    private constructor(
        public readonly userId: string,
        public readonly uid: string,
        public readonly email: string,
        public readonly accessToken: string
    ) {
        this.profile = null;
    }

    /**
     * 認証情報からユーザーインスタンスを作成する
     * @param authInfo
     */
    static createInstance(authInfo: { userId: string, uid: string, email: string, accessToken: string }): User {
        return new User(authInfo.userId, authInfo.uid, authInfo.email, authInfo.accessToken);
    }

    /**
     * DBのユーザー情報を元にユーザーモデルを組み立てる
     */
    static async fetchUser(props: { uid: string }): Promise<User> {
        // 問い合わせ
        const userRepository = new UserRepository();
        const users = await userRepository.getAll();
        const attributesList = users.filteredByMatchUid(props.uid).getAsTableAttributes();

        // ガード
        if (DataValidator.isEmpty(attributesList)) {
            console.error(users);
            throw new Error(ErrorMessages.CRUD_READ);
        }

        // ユーザーのインスタンスを生成
        const userTableAttributes = attributesList[0];
        const user = await User.createInstance({
            userId: userTableAttributes.userId,
            uid: userTableAttributes.uid,
            email: userTableAttributes.email,
            accessToken: userTableAttributes.accessToken
        });

        // プロフィールをセット
        user.profile = await Profile.fetchProfile({uid: user.uid});

        return user;
    }


    /**
     * DBのユーザー情報を元にユーザーモデルを組み立てる
     */
    static async fetchUserByAccessToken(props: { accessToken: string }): Promise<User> {
        // 問い合わせ
        const userRepository = new UserRepository();
        await userRepository.getAll();
        const attributesList = userRepository.filteredByMatchAccessToken(props.accessToken).getAsTableAttributes();

        console.log(props.accessToken);
        console.log(attributesList);
        // ガード
        if (DataValidator.isEmpty(attributesList)) {
            console.error(userRepository.getRecords());
            throw new Error(ErrorMessages.CRUD_READ);
        }

        // ユーザーのインスタンスを生成
        const userTableAttributes = attributesList[0];
        const user = await User.createInstance({
            userId: userTableAttributes.userId,
            uid: userTableAttributes.uid,
            email: userTableAttributes.email,
            accessToken: userTableAttributes.accessToken
        });

        // プロフィールをセット
        user.profile = await Profile.fetchProfile({uid: user.uid});

        return user;
    }

    /**
     * ユーザーを新規作成する
     * 外部から呼び出すための
     * @param props
     */
    static async createUser(props: { email: string, accessToken: string }): Promise<User> {
        const userDraft = new User("", "", props.email, props.accessToken);
        return userDraft.createRecord({email: props.email, accessToken: props.accessToken});
    }

    /**
     * ユーザーの詳細を取得する
     */
    public async getUserAttributes(): Promise<UserTableAttributes | null> {
        // DBから取得する
        const users = await this.userRepository.getAll();
        // HACK: uidでもいいが、信用できるユニークがメールなので取得する
        return users.filteredByMatchUid(this.uid).getFirstAsTableAttributes();
    };

    /**
     * ユーザーを新規作成する
     * @param props
     */
    private async createRecord(props: {
        email: string
        accessToken: string
    }): Promise<User> {

        const item = await this.userRepository.createUser({
            email: props.email,
            accessToken: props.accessToken
        });

        const user = await User.createInstance({
            userId: item.userId,
            uid: item.uid,
            email: item.email,
            accessToken: item.accessToken
        });

        const defaultNickName = "user" + user.uid;
        const defaultIconImagePath = "";
        user.profile = Profile.createInstance({uid: user.uid, nickName: defaultNickName, iconImagePath: defaultIconImagePath})

        return user;

    }

    /**
     * ログインする
     */
    public async login(accessToken: string) {
        console.log("====login====");
        console.log(accessToken);
        // const timeStamp = this.timestamp;

        await this.updateAccessToken(accessToken);
    }

    /**
     * アクセストークンを更新する
     */
    private async updateAccessToken(accessToken: string): Promise<void> {
        console.log("====updateAccessToken====");
        console.log(accessToken);
        const client = new DynamoDBClient({region: ENVIRONMENT.region});
        const docClient = DynamoDBDocumentClient.from(client);
        const updateCommand = new UpdateCommand({
            TableName: ENVIRONMENT.authTableName,
            Key: {
                userId: this.userId
            },
            UpdateExpression: "set accessToken = :accessToken",
            ExpressionAttributeValues: {
                ":accessToken": accessToken,
            },
            ReturnValues: "ALL_NEW",
        });
        await docClient.send(updateCommand);
    }
}