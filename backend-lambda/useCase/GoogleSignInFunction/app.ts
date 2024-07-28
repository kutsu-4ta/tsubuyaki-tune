import LambdaEvent from "../../http/LambdaEventIF";
import {PostRequest} from "../../utility/sendHttp/PostRequest";
import {OAuthResponse} from "./GoogleSignInFunctionIF";
import {ENVIRONMENT, ErrorMessages, Messages} from "../../consts/systems";
import {User} from "../../models/User";
import {GoogleOAuth} from "../../utility/authManager/googleOAuth";
import {UserRepository} from "../../db/Repository/UserTable/UserRepository";
import {GoogleSignInRequestInput} from "./GoogleSignInRequestInput";
import {Profile} from "../../models/Profile";

/**
 * OAuthの流れ
 * ① React → Googleの同意画面 → React
 * ② React → Lambda
 * ③ Lambda → Googleサーバのアクセストークン取得用API
 * ④ Lambda → GoogleサーバのJWTトークンデコード用API
 *
 * ②〜④の処理
 * @param event
 */
export const lambdaHandler = async (event: LambdaEvent): Promise<any> => {
    try {
        console.log("==SetUp_lambdaHandler==");
        const userRepository = new UserRepository();
        const requestInput = GoogleSignInRequestInput.create(event);

        console.log("==Main_lambdaHandler==");
        // OAuth実行
        const oAuthResponse = await fetchAccessToken(requestInput);

        // ユーザーの詳細な認証情報
        const detailUserInfo = await GoogleOAuth.fetchAuthInfoDetail({
            idToken: oAuthResponse.id_token,
            accessToken: oAuthResponse.access_token
        });

        // ユーザを取得
        const users = await userRepository.getAll();
        const userTableAttributes = users.filteredByMatchEmail(detailUserInfo.email).getFirstAsTableAttributes();

        if (userTableAttributes === null) {
            // 新規登録
            const newUser = await User.createUser({
                email: detailUserInfo.email,
                accessToken: oAuthResponse.access_token
            });
            const newUserTableAttributes = await newUser.getUserAttributes() ?? null;

            // 作れたかチェック
            if (newUserTableAttributes === null) {
                console.error(newUser);
                throw new Error(ErrorMessages.CRUD_CREATE);
            }

            // プロフィールのレコードを作成
            const defaultUserIconPath = ""; // TODO: 定数 S3のデフォルトアイコンが格納されているパス
            const profileDraft = Profile.createInstance({
                uid:newUserTableAttributes.uid,
                nickName: newUserTableAttributes.userId,
                iconImagePath: defaultUserIconPath,
            });
            await profileDraft.updateRecord();

            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: Messages.SUCCESS + "to create!",
                    data: {
                        uid: newUserTableAttributes.uid,
                        message: "please try login this App."
                    }
                }),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                }
            }
        }


        // 既存ユーザーでログイン
        const user = await User.fetchUser({uid: userTableAttributes.uid});
        await user.login();
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: Messages.SUCCESS + "to login",
                data: {
                    uid: user.uid,
                    message: "please enjoy this App."
                }
            }),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
        }
    } catch (error) {
        console.log("==Catch_lambdaHandler==");
        console.error(error);
        throw new Error(Messages.INTERNAL_SERVER_ERROR);
    }
};

/**
 * Googleの認証サーバーからアクセストークンを受け取る
 * @param requestInput
 */
function fetchAccessToken(requestInput: GoogleSignInRequestInput): Promise<OAuthResponse> {
    const postRequest = new PostRequest({
        hostname: 'www.googleapis.com',
        port: 443,
        path: '/oauth2/v4/token',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    const clientId = requestInput.clientId;
    const code = requestInput.code;
    const postData = `grant_type=authorization_code&access_type=offline&redirect_uri=${ENVIRONMENT.redirectUrl}&client_secret=${ENVIRONMENT.clientSecret}&client_id=${clientId}&code=${code}`;

    // OAuth認証を実行
    return postRequest.post(postData);
}