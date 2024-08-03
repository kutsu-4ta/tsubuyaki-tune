
/**
 * SPEC:ハッシュタグは"#hoge"の形式のstringである
 */
export type hashTagString = `#${string}`;

/**
 * 例：2024-07-18 15:34:25
 * yyyy-MM-dd HH:mm:ss
 */
export type dateTimeString = `${number}${number}${number}${number}-${number}${number}-${number}${number} ${number}${number}:${number}${number}:${number}${number}`;
