import { createFeature, FeatureContext, FeatureTransformContext } from './feature';
import { generalDiagnostics } from './diagnostics';
import * as STSymbol from './st-symbol';
import type { StylableSymbol } from './st-symbol';
import { plugableRecord } from '../helpers/plugable-record';
import { parseStImport, parsePseudoImport, parseImportMessages } from '../helpers/import';
import { validateCustomPropertyName } from '../helpers/css-custom-property';
import type { StylableMeta } from '../stylable-meta';
import path from 'path';
import type { ImmutablePseudoClass, PseudoClass } from '@tokey/css-selector-parser';
import type * as postcss from 'postcss';
import type { DiagnosticBase } from '../diagnostics';

export interface ImportSymbol {
    _kind: 'import';
    type: 'named' | 'default';
    name: string;
    import: Imported;
    context: string;
}

export interface Imported {
    from: string;
    defaultExport: string;
    named: Record<string, string>;
    keyframes: Record<string, string>;
    rule: postcss.Rule | postcss.AtRule;
    request: string;
    context: string;
}

export const PseudoImport = `:import`;
export const PseudoImportDecl = {
    DEFAULT: `-st-default` as const,
    NAMED: `-st-named` as const,
    FROM: `-st-from` as const,
};

/**
 * ImportTypeHook is used as a way to cast imported symbols before resolving their actual type.
 * currently used only for `keyframes` as they are completely on a separate namespace from other symbols.
 *
 * Hooks are registered statically since the features are static and cannot be selected/disabled.
 * If the system will ever change to support picking features dynamically, this mechanism would
 * have to move into the `metaInit` hook.
 */
export const ImportTypeHook = new Map<
    StylableSymbol['_kind'] & keyof Imported,
    (context: FeatureContext, localName: string, importName: string, importDef: Imported) => void
>();

const dataKey = plugableRecord.key<Imported[]>('imports');

export const diagnostics = {
    ...parseImportMessages,
    NO_ST_IMPORT_IN_NESTED_SCOPE(): DiagnosticBase {
        return {
            code: '05011',
            message: `cannot use "@st-import" inside of nested scope`,
            severity: 'error',
        };
    },
    NO_PSEUDO_IMPORT_IN_NESTED_SCOPE(): DiagnosticBase {
        return {
            code: '05012',
            message: `cannot use ":import" inside of nested scope`,
            severity: 'error',
        };
    },
    INVALID_CUSTOM_PROPERTY_AS_VALUE(name: string, as: string): DiagnosticBase {
        return {
            code: '05013',
            message: `invalid alias for custom property "${name}" as "${as}"; custom properties must be prefixed with "--" (double-dash)`,
            severity: 'error',
        };
    },
    FORBIDDEN_DEF_IN_COMPLEX_SELECTOR: generalDiagnostics.FORBIDDEN_DEF_IN_COMPLEX_SELECTOR,
    UNKNOWN_IMPORTED_SYMBOL(name: string, path: string): DiagnosticBase {
        return {
            code: '05015',
            message: `cannot resolve imported symbol "${name}" from stylesheet "${path}"`,
            severity: 'error',
        };
    },
    UNKNOWN_IMPORTED_FILE(path: string): DiagnosticBase {
        return {
            code: '05016',
            message: `cannot resolve imported file: "${path}"`,
            severity: 'error',
        };
    },
};

// HOOKS

export const hooks = createFeature<{
    SELECTOR: PseudoClass;
    IMMUTABLE_SELECTOR: ImmutablePseudoClass;
}>({
    metaInit({ meta }) {
        plugableRecord.set(meta.data, dataKey, []);
    },
    analyzeInit(context) {
        const imports = plugableRecord.getUnsafe(context.meta.data, dataKey);
        const dirContext = path.dirname(context.meta.source);
        // collect shallow imports
        for (const node of context.meta.ast.nodes) {
            const isImportDef =
                (node.type === `atrule` && node.name === `st-import`) ||
                (node.type === `rule` && node.selector === `:import`);
            if (!isImportDef) {
                continue;
            }
            const parsedImport =
                node.type === `atrule`
                    ? parseStImport(node, dirContext, context.diagnostics)
                    : parsePseudoImport(node, dirContext, context.diagnostics);
            imports.push(parsedImport);
            addImportSymbols(parsedImport, context, dirContext);
        }
    },
    analyzeAtRule({ context, atRule }) {
        if (atRule.name !== `st-import`) {
            return;
        }
        if (atRule.parent?.type !== `root`) {
            context.diagnostics.report(diagnostics.NO_ST_IMPORT_IN_NESTED_SCOPE(), {
                node: atRule,
            });
        }
        // remove `@st-import` at rules - ToDo: move to transformer
        atRule.remove();
    },
    analyzeSelectorNode({ context, rule, node }) {
        if (node.value !== `import`) {
            return;
        }
        if (rule.selector !== `:import`) {
            context.diagnostics.report(
                diagnostics.FORBIDDEN_DEF_IN_COMPLEX_SELECTOR(PseudoImport),
                { node: rule }
            );
            return;
        }
        if (rule.parent?.type !== `root`) {
            context.diagnostics.report(diagnostics.NO_PSEUDO_IMPORT_IN_NESTED_SCOPE(), {
                node: rule,
            });
        }
        // remove rules with `:import` selector - ToDo: move to transformer
        rule.remove();
    },
    transformInit({ context }) {
        validateImports(context);
    },
});

// API

export function getImportStatements({ data }: StylableMeta): ReadonlyArray<Imported> {
    const state = plugableRecord.getUnsafe(data, dataKey);
    return state;
}

export function createImportSymbol(
    importDef: Imported,
    type: `default` | `named`,
    name: string,
    dirContext: string
): ImportSymbol {
    return {
        _kind: 'import',
        type: type === 'default' ? `default` : `named`,
        name: type === `default` ? name : importDef.named[name],
        import: importDef,
        context: dirContext,
    };
}

// internal

function addImportSymbols(importDef: Imported, context: FeatureContext, dirContext: string) {
    checkForInvalidAsUsage(importDef, context);
    if (importDef.defaultExport) {
        STSymbol.addSymbol({
            context,
            localName: importDef.defaultExport,
            symbol: createImportSymbol(importDef, `default`, `default`, dirContext),
            node: importDef.rule,
        });
    }
    Object.keys(importDef.named).forEach((name) => {
        STSymbol.addSymbol({
            context,
            localName: name,
            symbol: createImportSymbol(importDef, `named`, name, dirContext),
            node: importDef.rule,
        });
    });
    // import as typed symbol
    for (const [type, handler] of ImportTypeHook.entries()) {
        if (type in importDef) {
            for (const [localName, importName] of Object.entries(importDef[type])) {
                handler(context, localName, importName, importDef);
            }
        }
    }
}

function checkForInvalidAsUsage(importDef: Imported, context: FeatureContext) {
    for (const [local, imported] of Object.entries(importDef.named)) {
        if (validateCustomPropertyName(imported) && !validateCustomPropertyName(local)) {
            context.diagnostics.report(
                diagnostics.INVALID_CUSTOM_PROPERTY_AS_VALUE(imported, local),
                { node: importDef.rule }
            );
        }
    }
}

function validateImports(context: FeatureTransformContext) {
    const imports = plugableRecord.getUnsafe(context.meta.data, dataKey);
    for (const importObj of imports) {
        const resolvedImport = context.resolver.resolveImported(importObj, '');

        if (!resolvedImport) {
            // warn about unknown imported files
            const fromDecl =
                importObj.rule.nodes &&
                importObj.rule.nodes.find(
                    (decl) => decl.type === 'decl' && decl.prop === PseudoImportDecl.FROM
                );

            context.diagnostics.report(diagnostics.UNKNOWN_IMPORTED_FILE(importObj.request), {
                node: fromDecl || importObj.rule,
                word: importObj.request,
            });
        } else if (resolvedImport._kind === 'css') {
            // warn about unknown named imported symbols
            for (const name in importObj.named) {
                const origName = importObj.named[name];
                const resolvedSymbol = context.resolver.resolveImported(importObj, origName);
                if (resolvedSymbol === null || !resolvedSymbol.symbol) {
                    const namedDecl =
                        importObj.rule.nodes &&
                        importObj.rule.nodes.find(
                            (decl) => decl.type === 'decl' && decl.prop === PseudoImportDecl.NAMED
                        );

                    context.diagnostics.report(
                        diagnostics.UNKNOWN_IMPORTED_SYMBOL(origName, importObj.request),
                        { node: namedDecl || importObj.rule, word: origName }
                    );
                }
            }
        }
    }
}
