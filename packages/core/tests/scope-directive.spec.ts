import { expect, use } from 'chai';
import { AtRule, Declaration, Rule } from 'postcss';
import { processorWarnings } from '../src';
import { transformerWarnings } from '../src/stylable-transformer';
import { flatMatch } from './matchers/flat-match';
import { expectWarnings, expectWarningsFromTransform, shouldReportNoDiagnostics } from './utils/diagnostics';
import { generateStylableResult, generateStylableRoot, processSource } from './utils/generate-test-util';

use(flatMatch);

describe('@st-scope', () => {
    describe('processing scopes', () => {
        it('should parse "@st-scope" directives', () => {
            const meta = processSource(`
                @st-scope .root{
                    .part {}
                }
            `,
                { from: 'path/to/style.css' }
            );

            shouldReportNoDiagnostics(meta);
            expect(meta.scopes).to.flatMatch([{
                type: 'atrule',
                name: 'st-scope',
                params: '.root'
            }]);
        });

        it('should parse "@st-scope" directives with a new class', () => {
            const meta = processSource(`
                @st-scope .newClass {
                    .part {}
                }
            `,
                { from: 'path/to/style.css' }
            );

            shouldReportNoDiagnostics(meta);
            expect(meta.scopes).to.flatMatch([{
                type: 'atrule',
                name: 'st-scope',
                params: '.newClass'
            }]);
        });

        it('should mark scope ref name on impacted rules', () => {
            const meta = processSource(
                `
                @st-scope .root {
                    .part {}
                    .otherPart {}
                }
            `,
                { from: 'path/to/style.css' }
            );

            const rules = meta.ast.nodes!;

            shouldReportNoDiagnostics(meta);

            expect((rules[0] as Rule).selector).to.equal('.root .part');
            expect((rules[1] as Rule).selector).to.equal('.root .otherPart');
            expect(rules[2]).to.eql(undefined);
        });
    });

    describe('transforming scoped selectors', () => {
        it('should scope "part" class to root', () => {
            const { meta } = generateStylableResult({
                entry: `/entry.st.css`,
                files: {
                    '/entry.st.css': {
                        namespace: 'entry',
                        content: `
                        @st-scope .root {
                            .part {}
                        }
                        `
                    }
                }
            });

            shouldReportNoDiagnostics(meta);

            expect(meta.outputAst!.nodes).to.flatMatch([{
                selector: '.entry--root .entry--part'
            }
            ]);
        });

        it('should scope "part" class using a default import', () => {
            const { meta } = generateStylableResult({
                entry: `/entry.st.css`,
                files: {
                    '/entry.st.css': {
                        namespace: 'entry',
                        content: `
                        :import {
                            -st-from: './imported.st.css';
                            -st-default: Comp;
                        }
                        @st-scope Comp {
                            .part {}
                        }
                        `
                    },
                    '/imported.st.css': {
                        namespace: 'imported',
                        content: `.root {}`
                    }
                }
            });

            shouldReportNoDiagnostics(meta);

            expect(meta.outputAst!.first).to.flatMatch({
                selector: '.imported--root .entry--part'
            });
        });

        it('scoped classes should not be mixable (into another class or element)', () => {
            const { meta } = generateStylableResult({
                entry: `/entry.st.css`,
                files: {
                    '/entry.st.css': {
                        namespace: 'entry',
                        content: `
                        :import {
                            -st-from: './imported.st.css';
                            -st-named: mymix;
                        }
                        .root {
                            -st-mixin: mymix;
                        }
                        `
                    },
                    '/imported.st.css': {
                        namespace: 'imported',
                        content: `
                        @st-scope .root {
                            .mymix {
                                color: red;
                            }
                        }`
                    }
                }
            });

            shouldReportNoDiagnostics(meta);

            const rule: Rule = meta.outputAst!.first as Rule;
            const decl: Declaration = rule.first as Declaration;
            expect(decl).to.equal(undefined);
        });

        it('scoped classes should be agnostic about -st-extend', () => {
            const { meta } = generateStylableResult({
                entry: `/entry.st.css`,
                files: {
                    '/entry.st.css': {
                        namespace: 'entry',
                        content: `
                        :import {
                            -st-from: './imported.st.css';
                            -st-named: mymix;
                        }
                        .root {
                            -st-extends: mymix;
                        }
                        .root:myState {
                            color: red;
                        }
                        `
                    },
                    '/imported.st.css': {
                        namespace: 'imported',
                        content: `
                        @st-scope .root {
                            .mymix {
                                -st-states: myState;
                            }
                        }`
                    }
                }
            });

            shouldReportNoDiagnostics(meta);

            const rule = meta.outputAst!.nodes![1] as Rule;
            expect(rule.selector).to.equal('.entry--root[data-imported-mystate]');
        });

        it('scope with media queries', () => {
            const { meta } = generateStylableResult({
                entry: `/entry.st.css`,
                files: {
                    '/entry.st.css': {
                        namespace: 'entry',
                        content: `
                        @st-scope .root {
                            @media screen (max-width: 100px) {
                                .part {}
                            }
                        }
                        `
                    }
                }
            });

            shouldReportNoDiagnostics(meta);

            const atRule = meta.outputAst!.nodes![0] as AtRule;
            const rule = atRule.nodes![0] as Rule;
            expect(rule.selector).to.equal('.entry--root .entry--part');
        });
    });

    describe('diagnostics', () => {
        it('should warn about multiple params in scope', () => {
            const config = {
                entry: `/entry.st.css`,
                files: {
                    '/entry.st.css': {
                        namespace: 'entry',
                        content: `
                        .root {}
                        .part {}
                        |@st-scope $.root .part$ {
                            .scopedPart {}
                        }|
                    `
                    }
                }
            };

            const { meta } = expectWarningsFromTransform(config, [
                { message: processorWarnings.SCOPE_PARAM_NOT_SIMPLE_SELECTOR('.root .part'),
                    file: '/entry.st.css', severity: 'warning' },
                { message: transformerWarnings.UNKNOWN_SCOPING_PARAM('.root .part'),
                    file: '/entry.st.css', severity: 'error' }
            ]);
            // tslint:disable-next-line:max-line-length
            expect((meta.outputAst!.nodes![2] as Rule).selector).to.equal('.entry--root .entry--part .entry--scopedPart');
            expect(meta.scopes).to.flatMatch([{
                type: 'atrule',
                name: 'st-scope',
                params: '.root .part'
            }]);
        });

        it('should warn about disallowed syntax as a scoping parameter', () => {
            expectWarnings(`
                |@st-scope $.root::before$ {
                    .part {}
                }|
            `, [
                // tslint:disable-next-line:max-line-length
                { message: processorWarnings.SCOPE_PARAM_NOT_SIMPLE_SELECTOR('.root::before'), file: 'entry.st.css', severity: 'warning' }
            ]);
        });

        it('should warn about scoping with a symbol that does not resolve to a stylesheet root', () => {
            const config = {
                entry: `/entry.st.css`,
                files: {
                    '/entry.st.css': {
                        namespace: 'entry',
                        content: `
                        :import {
                            -st-from: './imported.st.css';
                            -st-named: importedPart;
                        }
                        |@st-scope $importedPart$ {
                            .part {}
                        }|
                        `
                    },
                    '/imported.st.css': {
                        namespace: 'imported',
                        content: `.importedPart {}`
                    }
                }
            };

            const { meta } = expectWarningsFromTransform(config, [
                // tslint:disable-next-line:max-line-length
                { message: transformerWarnings.SCOPE_PARAM_NOT_ROOT('importedPart'), file: '/entry.st.css', severity: 'error' }
            ]);
            expect((meta.outputAst!.first as Rule).selector).to.equal('importedPart .entry--part');
        });

        it('should warn about scoping with a symbol that originates from a JS file', () => {
            const config = {
                entry: `/entry.st.css`,
                files: {
                    '/entry.st.css': {
                        namespace: 'entry',
                        content: `
                        :import {
                            -st-from: './imported.js';
                            -st-named: someVar;
                        }
                        |@st-scope $someVar$ {
                            .part {}
                        }|
                        `
                    },
                    '/imported.js': {
                        namespace: 'imported',
                        content: `
                            module.exports = {
                                someVar: 'someValue'
                            }
                        `
                    }
                }
            };

            const { meta } = expectWarningsFromTransform(config, [
                // tslint:disable-next-line:max-line-length
                { message: transformerWarnings.SCOPE_PARAM_NOT_CSS('someVar'), file: '/entry.st.css', severity: 'error' }
            ]);
            expect((meta.outputAst!.first as Rule).selector).to.equal('someVar .entry--part');
        });

        it('should warn about a missing scoping parameter', () => {
            const config = {
                entry: `/entry.st.css`,
                files: {
                    '/entry.st.css': {
                        namespace: 'entry',
                        content: `
                        |@st-scope {
                            .part {}
                        }|
                        `
                    }
                }
            };

            const { meta } = expectWarningsFromTransform(config, [
                { message: processorWarnings.MISSING_SCOPING_PARAM(), file: '/entry.st.css', severity: 'warning' }
            ]);
            expect((meta.outputAst!.first as Rule).selector).to.equal('.entry--part');
        });

        it('should warn about an unknown scoping parameter', () => {
            const config = {
                entry: `/entry.st.css`,
                files: {
                    '/entry.st.css': {
                        namespace: 'entry',
                        content: `
                        |@st-scope $unknown$ {
                            .part {}
                        }|
                        `
                    }
                }
            };
            const { meta } = expectWarningsFromTransform(config, [
                // tslint:disable-next-line:max-line-length
                { message: transformerWarnings.UNKNOWN_SCOPING_PARAM('unknown'), file: '/entry.st.css', severity: 'error' }
            ]);
            expect((meta.outputAst!.first as Rule).selector).to.equal('unknown .entry--part');
        });

        it('should warn about vars definition inside a scope', () => {
            const config = {
                entry: `/entry.st.css`,
                files: {
                    '/entry.st.css': {
                        namespace: 'entry',
                        content: `
                        @st-scope .root {
                            |:vars {
                                myColor: red;
                            }|

                            .part {}
                        }
                    `
                    }
                }
            };

            const { meta } = expectWarningsFromTransform(config, [
                { message: processorWarnings.NO_VARS_DEF_IN_ST_SCOPE(), file: '/entry.st.css', severity: 'warning' }
            ]);
            expect((meta.outputAst!.first as Rule).selector).to.equal('.entry--root .entry--part');
        });

        it('should warn about import usage inside a scope', () => {
            const config = {
                entry: `/entry.st.css`,
                files: {
                    '/entry.st.css': {
                        namespace: 'entry',
                        content: `
                        @st-scope .root {
                            |:import {
                                -st-from: "imported.st.css";
                                -st-default: Comp;
                            }|

                            .part {}
                        }
                    `
                    }
                }
            };

            const { meta } = expectWarningsFromTransform(config, [
                { message: processorWarnings.NO_IMPORT_IN_ST_SCOPE(), file: '/entry.st.css', severity: 'warning' }
            ]);
            expect((meta.outputAst!.first as Rule).selector).to.equal('.entry--root .entry--part');
        });
    });
});
