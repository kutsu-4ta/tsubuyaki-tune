import {decodeJwtTokenResponseType} from "../../useCase/GoogleSignInFunction/GoogleSignInFunctionIF";
import {Messages} from "../../consts/systems";
import {GetRequest} from "../sendHttp/GetRequest";

export class GoogleOAuth {
    /**
     * ユーザーの詳細情報を問い合わせる
     * @param props
     */
    static async fetchAuthInfoDetail(props: { idToken: string, accessToken: string }): Promise<decodeJwtTokenResponseType> {
        return await GoogleOAuth.decodeJWTToken({
            idToken: props.idToken,
            accessToken: props.accessToken
        }).then((response: decodeJwtTokenResponseType) => {
            if (!response.email) {
                console.error(response);
                throw new Error(Messages.INTERNAL_SERVER_ERROR);
            }
            return response;
        }).catch((err) => {
            console.error(err);
            throw new Error(Messages.INTERNAL_SERVER_ERROR);
        });
    }

    /**
     * Googleのサーバーに問い合わせてJWTトークンのデコードを行う
     * @param props
     */
    static async decodeJWTToken(props: { idToken: string, accessToken: string }): Promise<decodeJwtTokenResponseType> {
        const getRequest = new GetRequest({
            hostname: 'www.googleapis.com',
            path: `/oauth2/v1/userinfo?id_toke=${props.idToken}`,
            headers: {
                'Authorization': `Bearer ${props.accessToken}`
            }
        });

        return getRequest.get();
    }
}