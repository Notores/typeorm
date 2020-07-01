interface ITypeOrmConfigInput {
    type?: string;
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    database?: string;
    synchronize?: boolean;
    logging?: boolean;
    migrations?: string[];
    subscribers?: string[];
}
interface ITypeOrmConfig {
    type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    synchronize: boolean;
    logging: boolean;
    entities: any[];
    migrations?: string[];
    subscribers?: string[];
}
interface IConnectOptions {
    addConnectionToRequest: boolean;
}
export declare function generateConnectionConfig(config?: ITypeOrmConfigInput, options?: object): ITypeOrmConfig;
export declare function connect(connectionConfigOrOptions?: ITypeOrmConfigInput | IConnectOptions, options?: IConnectOptions): Promise<void>;
export {};
//# sourceMappingURL=index.d.ts.map