import {Tsubuyaki} from "../Tsubuyaki/Tsubuyaki";

export interface TsubuyakiTableIF {

    tsubuyakiList: Tsubuyaki[]

    fetchTsubuyakiList(props: { accessToken: string, uid: string }): Promise<{ updateCount: number } | void>

    getTsubuyakiList(): Tsubuyaki[]
}