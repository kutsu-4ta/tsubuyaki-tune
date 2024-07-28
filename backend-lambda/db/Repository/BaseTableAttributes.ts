import {TableAttributesIF} from "./TableAttributesIF";

/**
 * DBテーブルのカラムの情報に対応するモデル
 */
export abstract class BaseTableAttributes implements TableAttributesIF {
    public isEmpty(key: string): boolean {
        return false;
    }
}