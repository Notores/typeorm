export interface IWhitelist<Entity> {
    get: Array<keyof Entity>;
    session?: Array<keyof Entity>;

    [key: string]: Array<keyof Entity> | undefined;
}
