import {Tsubuyaki} from "../Tsubuyaki/Tsubuyaki";

export interface TsubuyakiTableIF {

    tsubuyakiList: Tsubuyaki[]

    fetchTsubuyakiList(): void

    getTsubuyakiList(): void
}