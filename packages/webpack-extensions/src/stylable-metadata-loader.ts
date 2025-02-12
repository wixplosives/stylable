import { Stylable, processNamespace } from '@stylable/core';
import { createStylableResolverCacheMap, createWebpackResolver } from '@stylable/webpack-plugin';
import findConfig from 'find-config';
import type { LoaderDefinition, LoaderContext } from 'webpack';
import { createMetadataForStylesheet } from './create-metadata-stylesheet.js';

let stylable: Stylable;
const getLocalConfig = loadLocalConfigLoader();

export interface LoaderOptions {
    exposeNamespaceMapping: boolean;
    resolveNamespace(namespace: string, filePath: string): string;
}

const defaultOptions: LoaderOptions = {
    resolveNamespace: processNamespace,
    exposeNamespaceMapping: false,
};

export const metadataLoaderLocation = __filename;

const metadataLoader: LoaderDefinition = function (content) {
    const { resolveNamespace, exposeNamespaceMapping }: LoaderOptions = {
        ...defaultOptions,
        ...this.getOptions(),
        ...getLocalConfig(this.rootContext),
    };

    stylable = stylable || createStylable(this, resolveNamespace);

    const { usedMeta, ...output } = createMetadataForStylesheet(
        stylable,
        content,
        this.resourcePath,
        exposeNamespaceMapping,
    );

    for (const [meta] of usedMeta) {
        this.addDependency(meta.source);
    }

    return 'export default ' + JSON.stringify(output);
};

function createStylable(
    loader: LoaderContext<any>,
    resolveNamespace: (namespace: string, filePath: string) => string,
): Stylable {
    if (!loader._compiler) {
        throw new Error('Stylable metadata loader requires a compiler instance');
    }
    const resolveModule = createWebpackResolver(loader.fs as any, {
        ...(loader._compiler.options.resolve as any),
        extensions: [],
    });
    return new Stylable({
        projectRoot: loader.rootContext,
        fileSystem: loader.fs as any,
        mode: loader._compiler.options.mode === 'development' ? 'development' : 'production',
        resolveModule,
        resolveNamespace,
        resolverCache: createStylableResolverCacheMap(loader._compiler),
    });
}

function loadLocalConfigLoader() {
    const localConfig = new Map<string, Partial<LoaderOptions>>();
    return (cwd: string): Partial<LoaderOptions> => {
        if (localConfig.has(cwd)) {
            return localConfig.get(cwd)!;
        }
        let config: Partial<LoaderOptions>;
        try {
            config = findConfig.require('stylable.config', { cwd }).metadataLoader;
        } catch {
            config = {};
        }
        localConfig.set(cwd, config);
        return config;
    };
}

export default metadataLoader;
