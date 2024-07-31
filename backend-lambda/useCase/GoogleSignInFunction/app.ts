import LambdaEvent from "../../http/request/LambdaEventIF";
import {PostRequest} from "../../utility/sendHttp/PostRequest";
import {decodeJwtTokenResponseType, OAuthResponse} from "./GoogleSignInFunctionIF";
import {ENVIRONMENT, ErrorMessages, Messages} from "../../consts/systems";
import {User} from "../../models/User";
import {GoogleOAuth} from "../../utility/authManager/googleOAuth";
import {UserRepository} from "../../db/Repository/UserTable/UserRepository";
import {GoogleSignInRequestInput} from "./GoogleSignInRequestInput";
import {Profile} from "../../models/Profile";
import {SignInSuccessResponse} from "./SignInSuccessResponse";

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
        let responseMessage = "";

        console.log("==Main_lambdaHandler==");
        // OAuth実行
        const oAuthResponse = await fetchAccessToken(requestInput);
        const latestAccessToken = oAuthResponse.access_token;

        // ユーザーの詳細な認証情報
        const detailUserInfo = await GoogleOAuth.fetchAuthInfoDetail({
            idToken: oAuthResponse.id_token,
            accessToken: latestAccessToken
        });

        // ユーザを取得
        const users = await userRepository.getAll();
        const userTableAttributes = users.filteredByMatchEmail(detailUserInfo.email).getFirstAsTableAttributes();

        console.log(`====${detailUserInfo.email }is exist ?===`);
        console.log(userTableAttributes !== null);

        let uid = "";
        if (userTableAttributes === null) {
            // ユーザー作成
           　const newUserUserId = await createUser(oAuthResponse, detailUserInfo);

            // メッセージ更新
            responseMessage = Messages.SUCCESS + "to create!";
            uid = newUserUserId??'';
        }else{
            responseMessage = Messages.SUCCESS + "to sign in!";
            uid = userTableAttributes.uid
        }

        // ユーザーでログイン
        const user = await User.fetchUser({uid: uid});
        await user.login(latestAccessToken);

        // レスポンスの組み立て
        const httpResponse: SignInSuccessResponse = new SignInSuccessResponse(
            {
                message: responseMessage,
                uid: user.uid,
                accessToken: latestAccessToken,
                email: user.email,
                nickName: user.profile?.nickName ?? '',
                iconImagePath: user.profile?.iconImagePath ?? ''
            });

        console.log(httpResponse.returnResponse());
        return httpResponse.returnResponse();
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

/**
 * ユーザーとプロフィールを新規登録する
 * @param oAuthResponse
 * @param detailUserInfo
 */
async function createUser(oAuthResponse: OAuthResponse, detailUserInfo: decodeJwtTokenResponseType): Promise<string | null> {
    // 新規登録
    const newUser = await User.createUser({
        email: detailUserInfo.email,
        accessToken: oAuthResponse.access_token
    });

    // ユーザーが作れているかチェック
    const newUserTableAttributes = await newUser.getUserAttributes() ?? null;
    if (newUserTableAttributes === null) {
        console.error(newUser);
        throw new Error(ErrorMessages.CRUD_CREATE);
    }

    // プロフィールのレコードを作成
    const defaultUserIconPath = ""; // TODO: 定数 S3のデフォルトアイコンが格納されているパス
    const profileDraft = Profile.createInstance({
        uid: newUserTableAttributes.uid,
        nickName: `User${newUserTableAttributes.uid}`,
        iconImagePath: defaultUserIconPath,
    });
    await profileDraft.updateRecord();

    return newUserTableAttributes.uid ?? null;
}