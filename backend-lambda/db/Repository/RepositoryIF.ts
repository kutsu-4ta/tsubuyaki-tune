export interface RepositoryIF {
    getRecords():Record<string, any>[]
    create(item: { [key: string]: any }): Promise<any>
    read(key: { [key: string]: any }): Promise<any>
    update(key: { [key: string]: any }, attributeValues: { [key: string]: any }): Promise<any>
}