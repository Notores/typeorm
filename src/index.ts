import {join} from 'path';
import {ConnectionOptions, createConnection, getCustomRepository} from "typeorm";
import {IRepositoryMetadata} from "./interface/IRepositoryMetadata";
import {
    loggerFactory,
    NotoresApplication,
    repositoryMetadataKey,
    connectionMetadataKey,
    connectionManagerMetadataKey
} from '@notores/core';
import {IConnectionManagerMetadata} from "./interface/IConnectionManagerMetadata";

const logger = loggerFactory(module);

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
    addConnectionToRequest: boolean
}

export function generateConnectionConfig(config?: ITypeOrmConfigInput, options: object = {}): ITypeOrmConfig {
    let conf: ITypeOrmConfig = {
        entities: [],
        database: "",
        host: "localhost",
        logging: true,
        password: "",
        port: 0,
        synchronize: false,
        type: "",
        username: ""
    };
    let jsonFile = {};
    try {
        jsonFile = require(join(process.cwd(), 'ormconfig.json'));
    } catch (e) {
    }

    conf = {
        ...conf,
        ...config,
        ...jsonFile,
    };

    const {
        DB_TYPE,
        DB_HOST,
        DB_PORT,
        DB_USERNAME,
        DB_PASSWORD,
        DB_NAME,
        DB_SYNCHRONIZE,
        DB_LOGGING,
    } = process.env;

    if (DB_TYPE) conf.type = DB_TYPE;
    if (DB_HOST) conf.host = DB_HOST;
    if (DB_PORT) conf.port = parseInt(DB_PORT);
    if (DB_USERNAME) conf.username = DB_USERNAME;
    if (DB_PASSWORD) conf.password = DB_PASSWORD;
    if (DB_NAME) conf.database = DB_NAME;
    if (DB_SYNCHRONIZE) conf.synchronize = !!DB_SYNCHRONIZE;
    if (DB_LOGGING) conf.logging = !!DB_LOGGING;

    if (process.env.NODE_ENV !== 'production') {
        logger.info(`Connection options: ${JSON.stringify(conf, null, 4)}`);
    }
    return conf;
}

export async function connect(connectionConfigOrOptions?: ITypeOrmConfigInput | IConnectOptions, options?: IConnectOptions): Promise<void> {
    const app: NotoresApplication = NotoresApplication.app;
    app.db = 'MongoDB';
    let config: ITypeOrmConfig = <ITypeOrmConfig>{};
    let opts: IConnectOptions = {addConnectionToRequest: true};
    if (connectionConfigOrOptions instanceof Object) {
        if (connectionConfigOrOptions.hasOwnProperty('host')) {
            config = generateConnectionConfig(connectionConfigOrOptions as ITypeOrmConfigInput)
        } else {
            opts = {
                ...opts,
                ...connectionConfigOrOptions
            };
        }
    } else {
        config = generateConnectionConfig();
    }

    app.db = config.type;
    config.entities = NotoresApplication.entities.map(e => e);

    try {
        const result = await createConnection(config as ConnectionOptions);
        logger.info('Database connection successful');

        app.connection = result;
        await result.synchronize(false);

        if (opts.addConnectionToRequest) {
            app.addConnectionToRequest();
        }

        for await(let mod of NotoresApplication.app.controllers) {
            try {
                const repositoriesMetadata: IRepositoryMetadata[] = Reflect.getMetadata(repositoryMetadataKey, mod) ?? [];
                for await(let metadata of repositoriesMetadata) {
                    if (metadata.entity) {
                        mod[metadata.name] = result.getRepository(metadata.entity);
                    }
                    if (metadata.customRepository) {
                        mod[metadata.name] = getCustomRepository(metadata.customRepository)
                        if (mod[metadata.name].defaultData) {
                            await mod[metadata.name].defaultData();
                        }
                    }
                }
            } catch (e) {
                console.log('errrrrrooooorrrrr', e);
            }
            try {
                const connectionManagerMetadata: IConnectionManagerMetadata = Reflect.getMetadata(connectionManagerMetadataKey, mod);
                if (connectionManagerMetadata) {
                    mod[connectionManagerMetadata.name] = result.manager;
                }
            } catch (e) {
                console.log('errrrrrooooorrrrr', e);
            }
            try {
                const connectionMetadata: IConnectionManagerMetadata = Reflect.getMetadata(connectionMetadataKey, mod);
                if (connectionMetadata) {
                    mod[connectionMetadata.name] = result;
                }
            } catch (e) {
                console.log('errrrrrooooorrrrr', e);
            }
        }

    } catch (e) {
        logger.error(`connection error: ${e.message}`);
        return e;
    }
}
