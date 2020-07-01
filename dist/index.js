"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connect = exports.generateConnectionConfig = void 0;
const path_1 = require("path");
const typeorm_1 = require("typeorm");
const core_1 = require("@notores/core");
const logger = core_1.loggerFactory(module);
function generateConnectionConfig(config, options = {}) {
    let conf = {
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
        jsonFile = require(path_1.join(process.cwd(), 'ormconfig.json'));
    }
    catch (e) {
    }
    conf = {
        ...conf,
        ...config,
        ...jsonFile,
    };
    const { DB_TYPE, DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_SYNCHRONIZE, DB_LOGGING, } = process.env;
    if (DB_TYPE)
        conf.type = DB_TYPE;
    if (DB_HOST)
        conf.host = DB_HOST;
    if (DB_PORT)
        conf.port = parseInt(DB_PORT);
    if (DB_USERNAME)
        conf.username = DB_USERNAME;
    if (DB_PASSWORD)
        conf.password = DB_PASSWORD;
    if (DB_NAME)
        conf.database = DB_NAME;
    if (DB_SYNCHRONIZE)
        conf.synchronize = !!DB_SYNCHRONIZE;
    if (DB_LOGGING)
        conf.logging = !!DB_LOGGING;
    if (process.env.NODE_ENV !== 'production') {
        logger.info(`Connection options: ${JSON.stringify(conf, null, 4)}`);
    }
    return conf;
}
exports.generateConnectionConfig = generateConnectionConfig;
async function connect(connectionConfigOrOptions, options) {
    var _a;
    const app = core_1.NotoresApplication.app;
    app.db = 'MongoDB';
    let config = {};
    let opts = { addConnectionToRequest: true };
    if (connectionConfigOrOptions instanceof Object) {
        if (connectionConfigOrOptions.hasOwnProperty('host')) {
            config = generateConnectionConfig(connectionConfigOrOptions);
        }
        else {
            opts = {
                ...opts,
                ...connectionConfigOrOptions
            };
        }
    }
    else {
        config = generateConnectionConfig();
    }
    app.db = config.type;
    config.entities = core_1.NotoresApplication.entities.map(e => e);
    try {
        const result = await typeorm_1.createConnection(config);
        logger.info('Database connection successful');
        app.connection = result;
        await result.synchronize(false);
        if (opts.addConnectionToRequest) {
            app.addConnectionToRequest();
        }
        for await (let mod of core_1.NotoresApplication.app.controllers) {
            try {
                const repositoriesMetadata = (_a = Reflect.getMetadata(core_1.repositoryMetadataKey, mod)) !== null && _a !== void 0 ? _a : [];
                for await (let metadata of repositoriesMetadata) {
                    if (metadata.entity) {
                        mod[metadata.name] = result.getRepository(metadata.entity);
                    }
                    if (metadata.customRepository) {
                        mod[metadata.name] = typeorm_1.getCustomRepository(metadata.customRepository);
                        if (mod[metadata.name].defaultData) {
                            await mod[metadata.name].defaultData();
                        }
                    }
                }
            }
            catch (e) {
                console.log('errrrrrooooorrrrr', e);
            }
            try {
                const connectionManagerMetadata = Reflect.getMetadata(core_1.connectionManagerMetadataKey, mod);
                if (connectionManagerMetadata) {
                    mod[connectionManagerMetadata.name] = result.manager;
                }
            }
            catch (e) {
                console.log('errrrrrooooorrrrr', e);
            }
            try {
                const connectionMetadata = Reflect.getMetadata(core_1.connectionMetadataKey, mod);
                if (connectionMetadata) {
                    mod[connectionMetadata.name] = result;
                }
            }
            catch (e) {
                console.log('errrrrrooooorrrrr', e);
            }
        }
    }
    catch (e) {
        logger.error(`connection error: ${e.message}`);
        return e;
    }
}
exports.connect = connect;
