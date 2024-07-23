
/**
 * SPEC:ハッシュタグは"#hoge"の形式のstringである
 */
export type hashTagString = `#${string}`;

/**
 * 例：2024-07-18-15:34
 */
export type dateTimeString = `${number}${number}${number}${number}-${number}${number}-${number}${number}-${number}${number}:${number}${number}`;
