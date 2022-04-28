import type * as postcss from 'postcss';
import type { Box } from './custom-values';
import type { StylableExports, StylableResults } from './stylable-transformer';

export interface ParsedValue {
    type: string;
    value: string;
    nodes?: any;
    resolvedValue?: string | Box<string, unknown>;
    url?: string;
}

export interface StateTypeValidator {
    name: string;
    args: string[];
}

export type StateArguments = Array<StateTypeValidator | string>;

export interface StateParsedValue {
    type: string;
    defaultValue?: string;
    arguments: StateArguments;
}

export interface OptimizeConfig {
    removeComments?: boolean;
    removeStylableDirectives?: boolean;
    removeUnusedComponents?: boolean;
    classNameOptimizations?: boolean;
    removeEmptyNodes?: boolean;
    shortNamespaces?: boolean;
}

export interface IStylableOptimizer {
    minifyCSS(css: string): string;
    optimize(
        config: OptimizeConfig,
        stylableResult: StylableResults,
        usageMapping: Record<string, boolean>,
        delimiter?: string
    ): void;
    getNamespace(namespace: string): string;
    getClassName(className: string): string;
    optimizeAst(
        config: OptimizeConfig,
        outputAst: postcss.Root,
        usageMapping: Record<string, boolean>,
        delimiter: string | undefined,
        jsExports: StylableExports,
        globals: Record<string, boolean>
    ): void;
    removeStylableDirectives(root: postcss.Root, shouldComment?: boolean): void;
}

export type ModuleResolver = (directoryPath: string, request: string) => string;
