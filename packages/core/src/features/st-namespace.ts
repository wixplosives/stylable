import path from 'path';
import { createFeature, FeatureContext } from './feature';
import { plugableRecord } from '../helpers/plugable-record';
import { filename2varname } from '../helpers/string';
import { stripQuotation } from '../helpers/string';
import { murmurhash3_32_gc } from '../murmurhash';

export const diagnostics = {
    INVALID_NAMESPACE_DEF: () => 'invalid @namespace',
    EMPTY_NAMESPACE_DEF: () => '@namespace must contain at least one character or digit',
    INVALID_NAMESPACE_REFERENCE: () => 'st-namespace-reference dose not have any value',
};

const dataKey = plugableRecord.key<string[]>('namespace');

// HOOKS

export const hooks = createFeature({
    metaInit({ meta }) {
        plugableRecord.set(meta.data, dataKey, []);
    },
    analyzeAtRule({ context, atRule }) {
        if (atRule.name !== 'st-namespace' && atRule.name !== 'namespace') {
            return;
        }
        const match = atRule.params.match(/["'](.*?)['"]/);
        if (match) {
            const collected = plugableRecord.getUnsafe(context.meta.data, dataKey);
            if (match[1].trim()) {
                collected.push(match[1]);
            } else {
                context.diagnostics.error(atRule, diagnostics.EMPTY_NAMESPACE_DEF());
            }
        } else {
            context.diagnostics.error(atRule, diagnostics.INVALID_NAMESPACE_DEF());
        }
    },
    prepareAST({ node, toRemove }) {
        if (node.type === 'atrule' && (node.name === `st-namespace` || node.name === `namespace`)) {
            toRemove.push(node);
        }
    },
});

// API

export function defaultProcessNamespace(namespace: string, origin: string, _source?: string) {
    return namespace + murmurhash3_32_gc(origin); // .toString(36);
}

export function setMetaNamespace(
    context: FeatureContext,
    resolveNamespace: typeof defaultProcessNamespace
): void {
    const meta = context.meta;
    // resolve namespace
    const collected = plugableRecord.getUnsafe(meta.data, dataKey);
    const namespace =
        collected[collected.length - 1] || filename2varname(path.basename(meta.source)) || 's';
    // resolve path origin
    let pathToSource: string | undefined;
    let length = meta.ast.nodes.length;
    while (length--) {
        const node = meta.ast.nodes[length];
        if (node.type === 'comment' && node.text.includes('st-namespace-reference')) {
            const i = node.text.indexOf('=');
            if (i === -1) {
                context.diagnostics.error(node, diagnostics.INVALID_NAMESPACE_REFERENCE());
            } else {
                pathToSource = stripQuotation(node.text.slice(i + 1));
            }
            break;
        }
    }
    // generate final namespace
    meta.namespace = resolveNamespace(
        namespace,
        pathToSource ? path.resolve(path.dirname(meta.source), pathToSource) : meta.source,
        meta.source
    );
}
