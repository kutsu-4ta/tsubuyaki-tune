export interface MentionArgumentIF {
    readonly idCategory: string
    readonly idValue: string
}

export default class Mention {
    private constructor(
        readonly idCategory: string,
        readonly idValue: string
    ) {
    }

    public static create(argument: MentionArgumentIF) {
        return new Mention(argument.idCategory, argument.idValue);
    }
}