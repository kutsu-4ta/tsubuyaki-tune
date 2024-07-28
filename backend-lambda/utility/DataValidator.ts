/**
 * データの入力形式をチェックする際の処理
 */
export class DataValidator {
    static isEmpty(array: any[]) {
        return array.length < 1
    }
}