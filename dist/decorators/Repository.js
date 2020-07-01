"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Manager = exports.Connection = exports.CustomRepository = exports.Repository = void 0;
require("reflect-metadata");
const core_1 = require("@notores/core");
const dist_1 = require("@notores/core/dist");
function Repository(ent) {
    return (target, name) => {
        var _a;
        let existingRepositories = (_a = Reflect.getOwnMetadata(core_1.repositoryMetadataKey, target)) !== null && _a !== void 0 ? _a : [];
        existingRepositories.push({ entity: ent, name });
        Reflect.defineMetadata(core_1.repositoryMetadataKey, existingRepositories, target);
    };
}
exports.Repository = Repository;
function CustomRepository(repo) {
    return (target, name) => {
        var _a;
        let existingRepositories = (_a = Reflect.getOwnMetadata(core_1.repositoryMetadataKey, target)) !== null && _a !== void 0 ? _a : [];
        existingRepositories.push({ name, customRepository: repo });
        Reflect.defineMetadata(core_1.repositoryMetadataKey, existingRepositories, target);
    };
}
exports.CustomRepository = CustomRepository;
function Connection() {
    return (target, name) => {
        Reflect.defineMetadata(core_1.connectionMetadataKey, { name }, target);
    };
}
exports.Connection = Connection;
function Manager() {
    return (target, name) => {
        Reflect.defineMetadata(dist_1.connectionManagerMetadataKey, { name }, target);
    };
}
exports.Manager = Manager;
