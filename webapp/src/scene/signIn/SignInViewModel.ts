import axios, {AxiosResponse} from "axios";
import Authentication, {AuthenticationArgumentIF} from "../../models/Authentication/Authentication";
import {SignInViewModelIF} from "./SignInViewModelIF";

export class SignInViewModel implements SignInViewModelIF {
    protected authState:Authentication = Authentication.initAuthentication();
    constructor(
    ) {
        console.log('====================SignInViewModel_called====================');
    }

    /**
     * セットアップ処理
     * @param argument
     */
    setUp(argument: { authentication: AuthenticationArgumentIF }): void {
        console.log('====================TimeLineViewModel_setup====================');
        this.authState.setAuthentication(argument.authentication);
        console.log('====================TimeLineViewModel_setup_end====================');
    }

    /**
     * クリーンアップ処理
     */
    cleanUp():void {
        console.log('cleanUp');
    }

    /**
     * サインインを実行する
     */
    async signIn(code:string): Promise<AxiosResponse<any>> {
        const endPoint = process.env.REACT_APP_LOGIN_API as string;
        const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID as string;

        const params = {
            code,
            client_id: clientId
        }
        return await this.postApi(endPoint, params);
    }

    /**
     * ポストリクエストを送信する
     */
    postApi = async (endPoint: string, params: { code: string, client_id: string }): Promise<AxiosResponse<any>> => {
        const axiosInstance = axios.create({
            headers: {
                'Authorization': 'allow',
                'x-api-key': '1yIDLcQTj28kU0fpfZFdCaZoi4dCoEgC8hLh1duf'
            }
        });
        return axiosInstance.post(endPoint, params);
    }
}