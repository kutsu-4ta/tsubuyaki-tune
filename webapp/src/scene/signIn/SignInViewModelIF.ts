import {AuthenticationArgumentIF} from "../../models/Authentication/Authentication";

export interface SignInViewModelIF {
    /**
     * データのフェッチやモデルのインスタンス化などを行う
     */
    setUp(argument: { authentication: AuthenticationArgumentIF }): void

    /**
     * サインインを行う
     */
    signIn(code: string): Promise<any>
}