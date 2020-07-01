import 'reflect-metadata';
import {IRepositoryMetadata} from "../interface/IRepositoryMetadata";
import {repositoryMetadataKey, connectionMetadataKey} from "@notores/core";
import {connectionManagerMetadataKey} from "@notores/core/dist";

export function Repository(ent: Function) {
    return (target: any, name: any) => {
        let existingRepositories: IRepositoryMetadata[] = Reflect.getOwnMetadata(repositoryMetadataKey, target) ?? [];

        existingRepositories.push({entity: ent, name});

        Reflect.defineMetadata(repositoryMetadataKey, existingRepositories, target);
    };
}

export function CustomRepository(repo: Function) {
    return (target: any, name: any) => {
        let existingRepositories: IRepositoryMetadata[] = Reflect.getOwnMetadata(repositoryMetadataKey, target) ?? [];

        existingRepositories.push({name, customRepository: repo});

        Reflect.defineMetadata(repositoryMetadataKey, existingRepositories, target);
    };
}

export function Connection() {
    return (target: any, name: any) => {
        Reflect.defineMetadata(connectionMetadataKey, {name}, target);
    };
}

export function Manager() {
    return (target: any, name: any) => {
        Reflect.defineMetadata(connectionManagerMetadataKey, {name}, target);
    };
}
