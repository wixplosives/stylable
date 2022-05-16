import { isAbsolute } from 'path';
import type * as postcss from 'postcss';
import type { Diagnostics } from './diagnostics';
import type { ImportSymbol, StylableSymbol } from './features';
import { isChildOfAtRule } from './helpers/rule';
import { scopeNestedSelector, parseSelectorWithCache } from './helpers/selector';

export function isValidDeclaration(decl: postcss.Declaration) {
    return typeof decl.value === 'string';
}

export const INVALID_MERGE_OF = (mergeValue: string) => {
    return `invalid merge of: \n"${mergeValue}"`;
};
// ToDo: move to helpers/mixin
export function mergeRules(
    mixinAst: postcss.Root,
    rule: postcss.Rule,
    mixinDecl: postcss.Declaration,
    report?: Diagnostics
) {
    let mixinRoot: postcss.Rule | null | 'NoRoot' = null;
    const nestedInKeyframes = isChildOfAtRule(rule, `keyframes`);
    mixinAst.walkRules((mixinRule: postcss.Rule) => {
        if (isChildOfAtRule(mixinRule, 'keyframes')) {
            return;
        }
        if (mixinRule.selector === '&' && !mixinRoot) {
            if (mixinRule.parent === mixinAst) {
                mixinRoot = mixinRule;
            } else {
                const { selector } = scopeNestedSelector(
                    parseSelectorWithCache(rule.selector),
                    parseSelectorWithCache(mixinRule.selector)
                );
                mixinRoot = 'NoRoot';
                mixinRule.selector = selector;
            }
        } else {
            const { selector } = scopeNestedSelector(
                parseSelectorWithCache(rule.selector),
                parseSelectorWithCache(mixinRule.selector)
            );
            mixinRule.selector = selector;
        }
    });

    if (mixinAst.nodes) {
        let nextRule: postcss.Rule | postcss.AtRule = rule;
        // TODO: handle rules before and after decl on entry
        mixinAst.nodes.slice().forEach((node) => {
            if (node === mixinRoot) {
                node.walkDecls((node) => {
                    rule.insertBefore(mixinDecl, node);
                });
            } else if (node.type === 'decl') {
                rule.insertBefore(mixinDecl, node);
            } else if (node.type === 'rule' || node.type === 'atrule') {
                const valid = !nestedInKeyframes;
                if (valid) {
                    if (rule.parent!.last === nextRule) {
                        rule.parent!.append(node);
                    } else {
                        rule.parent!.insertAfter(nextRule, node);
                    }
                    nextRule = node;
                } else {
                    report?.warn(rule, INVALID_MERGE_OF(node.toString()));
                }
            }
        });
    }

    return rule;
}

export function getSourcePath(root: postcss.Root, diagnostics: Diagnostics) {
    const source = (root.source && root.source.input.file) || '';
    if (!source) {
        diagnostics.error(root, 'missing source filename');
    } else if (!isAbsolute(source)) {
        throw new Error('source filename is not absolute path: "' + source + '"');
    }
    return source;
}

export function getAlias(symbol: StylableSymbol): ImportSymbol | undefined {
    if (symbol._kind === 'class' || symbol._kind === 'element') {
        if (!symbol[`-st-extends`]) {
            return symbol.alias;
        }
    }

    return undefined;
}
