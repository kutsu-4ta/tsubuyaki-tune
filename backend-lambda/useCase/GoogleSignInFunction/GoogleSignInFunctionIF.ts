/**
 * 【仕様】このlambdaHandlerで入力として受け取る値
 */
export interface RequestInputIF {
    code:string
    clientId:string
}

/**
 * 【仕様】access_token取得用のGoogleAPIが返してくれるレスポンス
 */
export interface OAuthResponse {
    id_token: string
    access_token: string
    expires_in: number
    refresh_token: string
    scope: string
    token_type: string
}

/**
 * 【仕様】id_tokenデコード用のGoogleAPIが返してくれるレスポンス
 */
export interface decodeJwtTokenResponseType {
    id: string // id
    email: string // email
    verified_email: true // sub email
    name: string // account name
    given_name: string // first name
    family_name: string // last name
    picture: string // image url
    locale: string // ja
}