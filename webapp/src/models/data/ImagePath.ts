export interface ImagePathIF {
    readonly alt: string
    readonly path: string
}

export default class ImagePath {
    private constructor(
        protected readonly alt: string,
        protected readonly path: string
    ) {
    }

    public static create(argument: ImagePathIF): ImagePath {
        return new ImagePath(argument.alt, argument.path);
    }
}