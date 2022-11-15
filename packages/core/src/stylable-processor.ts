import type * as postcss from 'postcss';
import { createDiagnosticReporter, Diagnostics } from './diagnostics';
import { knownPseudoClassesWithNestedSelectors } from './native-reserved-lists';
import { StylableMeta } from './stylable-meta';
import { CSSCustomProperty, STVar, STCustomSelector } from './features';
import { generalDiagnostics } from './features/diagnostics';
import {
    FeatureContext,
    STSymbol,
    STImport,
    STNamespace,
    STGlobal,
    STScope,
    CSSClass,
    CSSType,
    CSSKeyframes,
    CSSLayer,
    CSSContains,
} from './features';
import { processDeclarationFunctions } from './process-declaration-functions';
import {
    walkSelector,
    isInPseudoClassContext,
    parseSelectorWithCache,
    stringifySelector,
} from './helpers/selector';
import { isChildOfAtRule } from './helpers/rule';

export const processorDiagnostics = {
    INVALID_NESTING: createDiagnosticReporter(
        '11011',
        'error',
        (child: string, parent: string) =>
            `nesting of rules within rules is not supported, found: "${child}" inside "${parent}"`
    ),
};

export class StylableProcessor implements FeatureContext {
    public meta!: StylableMeta;
    constructor(
        public diagnostics = new Diagnostics(),
        private resolveNamespace = STNamespace.defaultProcessNamespace
    ) {}
    public process(root: postcss.Root): StylableMeta {
        this.meta = new StylableMeta(root, this.diagnostics);

        STImport.hooks.analyzeInit(this);
        CSSCustomProperty.hooks.analyzeInit(this);

        this.handleAtRules(root);

        root.walkRules((rule) => {
            if (!isChildOfAtRule(rule, 'keyframes')) {
                this.handleRule(rule, {
                    isScoped: isChildOfAtRule(rule, `st-scope`),
                    reportUnscoped: true,
                });
            }
            const parent = rule.parent;
            if (parent?.type === 'rule') {
                this.diagnostics.report(
                    processorDiagnostics.INVALID_NESTING(
                        rule.selector,
                        (parent as postcss.Rule).selector
                    ),
                    { node: rule }
                );
            }
        });

        const isStylable = this.meta.type === 'stylable';
        root.walkDecls((decl) => {
            const parent = decl.parent as postcss.ChildNode;
            if (parent.type === 'rule' && parent.selector === ':vars' && isStylable) {
                // ToDo: remove once
                // - custom property definition is allowed in var value
                // - url collection is removed from st-var
                return;
            }
            CSSClass.hooks.analyzeDeclaration({ context: this, decl });
            CSSCustomProperty.hooks.analyzeDeclaration({ context: this, decl });
            CSSContains.hooks.analyzeDeclaration({ context: this, decl });

            this.collectUrls(decl);
        });
        STCustomSelector.hooks.analyzeDone(this);

        STNamespace.setMetaNamespace(this, this.resolveNamespace);

        STSymbol.reportRedeclare(this);

        return this.meta;
    }

    protected handleAtRules(root: postcss.Root) {
        const analyzeRule = (rule: postcss.Rule, { isScoped }: { isScoped: boolean }) => {
            return this.handleRule(rule, {
                isScoped,
                reportUnscoped: false,
            });
        };

        root.walkAtRules((atRule) => {
            switch (atRule.name) {
                case 'st-import': {
                    STImport.hooks.analyzeAtRule({
                        context: this,
                        atRule,
                        analyzeRule,
                    });
                    break;
                }
                case 'namespace':
                case 'st-namespace': {
                    STNamespace.hooks.analyzeAtRule({
                        context: this,
                        atRule,
                        analyzeRule,
                    });
                    break;
                }
                case 'keyframes':
                    CSSKeyframes.hooks.analyzeAtRule({
                        context: this,
                        atRule,
                        analyzeRule,
                    });
                    break;
                case 'layer':
                    CSSLayer.hooks.analyzeAtRule({
                        context: this,
                        atRule,
                        analyzeRule,
                    });
                    break;
                case 'import':
                    STImport.hooks.analyzeAtRule({
                        context: this,
                        atRule,
                        analyzeRule,
                    });
                    CSSLayer.hooks.analyzeAtRule({
                        context: this,
                        atRule,
                        analyzeRule,
                    });
                    break;
                case 'custom-selector': {
                    STCustomSelector.hooks.analyzeAtRule({
                        context: this,
                        atRule,
                        analyzeRule,
                    });
                    break;
                }
                case 'st-scope':
                    STScope.hooks.analyzeAtRule({ context: this, atRule, analyzeRule });
                    break;
                case 'property':
                case 'st-global-custom-property': {
                    CSSCustomProperty.hooks.analyzeAtRule({
                        context: this,
                        atRule,
                        analyzeRule,
                    });
                    break;
                }
                case 'container': {
                    CSSContains.hooks.analyzeAtRule({
                        context: this,
                        atRule,
                        analyzeRule,
                    });
                    break;
                }
            }
        });
    }
    private collectUrls(decl: postcss.Declaration) {
        processDeclarationFunctions(
            decl,
            (node) => {
                if (node.type === 'url') {
                    this.meta.urls.push(node.url);
                }
            },
            false
        );
    }
    protected handleRule(
        rule: postcss.Rule,
        { isScoped, reportUnscoped }: { isScoped: boolean; reportUnscoped: boolean }
    ) {
        const selectorAst = parseSelectorWithCache(rule.selector);

        let locallyScoped = isScoped;

        walkSelector(selectorAst, (node, ...nodeContext) => {
            const [index, nodes, parents] = nodeContext;
            const type = node.type;
            if (type === 'selector' && !isInPseudoClassContext(parents)) {
                // reset scope check between top level selectors
                locallyScoped = isScoped;
            }

            if (node.type === 'pseudo_class') {
                if (node.value === 'import') {
                    STImport.hooks.analyzeSelectorNode({
                        context: this,
                        node,
                        rule,
                        walkContext: nodeContext,
                    });
                } else if (node.value === 'vars') {
                    return STVar.hooks.analyzeSelectorNode({
                        context: this,
                        node,
                        rule,
                        walkContext: nodeContext,
                    });
                } else if (node.value === `global`) {
                    return STGlobal.hooks.analyzeSelectorNode({
                        context: this,
                        node,
                        rule,
                        walkContext: nodeContext,
                    });
                } else if (node.value.startsWith('--')) {
                    // ToDo: move to css-class feature
                    locallyScoped =
                        locallyScoped ||
                        STCustomSelector.isScoped(this.meta, node.value.slice(2)) ||
                        false;
                } else if (!knownPseudoClassesWithNestedSelectors.includes(node.value)) {
                    return walkSelector.skipNested;
                }
            } else if (node.type === 'class') {
                CSSClass.hooks.analyzeSelectorNode({
                    context: this,
                    node,
                    rule,
                    walkContext: nodeContext,
                });

                locallyScoped = CSSClass.validateClassScoping({
                    context: this,
                    classSymbol: CSSClass.get(this.meta, node.value)!,
                    locallyScoped,
                    reportUnscoped,
                    node,
                    nodes,
                    index,
                    rule,
                });
            } else if (node.type === 'type') {
                CSSType.hooks.analyzeSelectorNode({
                    context: this,
                    node,
                    rule,
                    walkContext: nodeContext,
                });

                locallyScoped = CSSType.validateTypeScoping({
                    context: this,
                    locallyScoped,
                    reportUnscoped,
                    node,
                    nodes,
                    index,
                    rule,
                });
            } else if (node.type === `id`) {
                if (node.nodes) {
                    this.diagnostics.report(
                        generalDiagnostics.INVALID_FUNCTIONAL_SELECTOR(`#` + node.value, `id`),
                        {
                            node: rule,
                            word: stringifySelector(node),
                        }
                    );
                }
            } else if (node.type === `attribute`) {
                if (node.nodes) {
                    this.diagnostics.report(
                        generalDiagnostics.INVALID_FUNCTIONAL_SELECTOR(
                            `[${node.value}]`,
                            `attribute`
                        ),
                        {
                            node: rule,
                            word: stringifySelector(node),
                        }
                    );
                }
            } else if (node.type === `nesting`) {
                if (node.nodes) {
                    this.diagnostics.report(
                        generalDiagnostics.INVALID_FUNCTIONAL_SELECTOR(node.value, `nesting`),
                        {
                            node: rule,
                            word: stringifySelector(node),
                        }
                    );
                }
            }
            return;
        });

        return locallyScoped;
    }
}

// ToDo: remove export and reroute import from feature
export const processNamespace = STNamespace.defaultProcessNamespace;
