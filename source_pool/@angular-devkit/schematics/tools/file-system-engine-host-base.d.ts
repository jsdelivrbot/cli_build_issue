/// <reference types="node" />
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BaseException } from '@angular-devkit/core';
import { EngineHost, RuleFactory, Source, TaskExecutor, TaskExecutorFactory } from '@angular-devkit/schematics';
import { Observable } from 'rxjs/Observable';
import { Url } from 'url';
import { FileSystemCollection, FileSystemCollectionDesc, FileSystemCollectionDescription, FileSystemSchematicDesc, FileSystemSchematicDescription } from './description';
export declare type OptionTransform<T extends object, R extends object> = (schematic: FileSystemSchematicDescription, options: T) => Observable<R>;
export declare class CollectionCannotBeResolvedException extends BaseException {
    constructor(name: string);
}
export declare class InvalidCollectionJsonException extends BaseException {
    constructor(_name: string, path: string);
}
export declare class SchematicMissingFactoryException extends BaseException {
    constructor(name: string);
}
export declare class FactoryCannotBeResolvedException extends BaseException {
    constructor(name: string);
}
export declare class CollectionMissingSchematicsMapException extends BaseException {
    constructor(name: string);
}
export declare class CollectionMissingFieldsException extends BaseException {
    constructor(name: string);
}
export declare class SchematicMissingFieldsException extends BaseException {
    constructor(name: string);
}
export declare class SchematicMissingDescriptionException extends BaseException {
    constructor(name: string);
}
export declare class SchematicNameCollisionException extends BaseException {
    constructor(name: string);
}
/**
 * A EngineHost base class that uses the file system to resolve collections. This is the base of
 * all other EngineHost provided by the tooling part of the Schematics library.
 */
export declare abstract class FileSystemEngineHostBase implements EngineHost<FileSystemCollectionDescription, FileSystemSchematicDescription> {
    protected abstract _resolveCollectionPath(name: string): string;
    protected abstract _resolveReferenceString(name: string, parentPath: string): {
        ref: RuleFactory<{}>;
        path: string;
    } | null;
    protected abstract _transformCollectionDescription(name: string, desc: Partial<FileSystemCollectionDesc>): FileSystemCollectionDesc;
    protected abstract _transformSchematicDescription(name: string, collection: FileSystemCollectionDesc, desc: Partial<FileSystemSchematicDesc>): FileSystemSchematicDesc;
    private _transforms;
    private _taskFactories;
    /**
     * @deprecated Use `listSchematicNames`.
     */
    listSchematics(collection: FileSystemCollection): string[];
    listSchematicNames(collection: FileSystemCollectionDescription): string[];
    registerOptionsTransform<T extends object, R extends object>(t: OptionTransform<T, R>): void;
    /**
     *
     * @param name
     * @return {{path: string}}
     */
    createCollectionDescription(name: string): FileSystemCollectionDesc;
    createSchematicDescription(name: string, collection: FileSystemCollectionDesc): FileSystemSchematicDesc;
    createSourceFromUrl(url: Url): Source | null;
    transformOptions<OptionT extends object, ResultT extends object>(schematic: FileSystemSchematicDesc, options: OptionT): Observable<ResultT>;
    getSchematicRuleFactory<OptionT extends object>(schematic: FileSystemSchematicDesc, _collection: FileSystemCollectionDesc): RuleFactory<OptionT>;
    registerTaskExecutor<T>(factory: TaskExecutorFactory<T>, options?: T): void;
    createTaskExecutor(name: string): Observable<TaskExecutor>;
    hasTaskExecutor(name: string): boolean;
}
