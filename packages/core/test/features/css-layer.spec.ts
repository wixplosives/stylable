import { CSSLayer } from '@stylable/core/dist/features';
import { testStylableCore, shouldReportNoDiagnostics } from '@stylable/core-test-kit';
import deindent from 'deindent';
import { expect } from 'chai';

describe('features/css-layer', () => {
    it('should analyze @layer', () => {
        const { sheets } = testStylableCore(`
            /* @atrule(single) entry__single */
            @layer single;

            /* @atrule(multi) entry__one, entry__two */
            @layer one, two;
            
            /* @atrule(rules) entry__with-rules */
            @layer with-rules {
                .a {}
                /* @atrule(nested) entry__nested */
                @layer nested {
                    .b {}
                }
                .c {}
            }

            /* @atrule(no name) */
            @layer {
                .d {}
            }
        `);

        const { meta, exports } = sheets['/entry.st.css'];

        shouldReportNoDiagnostics(meta);

        // symbols
        expect(CSSLayer.get(meta, 'single'), 'single symbol').to.eql({
            _kind: 'layer',
            name: 'single',
            alias: 'single',
            global: false,
            import: undefined,
        });
        expect(CSSLayer.get(meta, 'one'), 'single symbol').to.eql({
            _kind: 'layer',
            name: 'one',
            alias: 'one',
            global: false,
            import: undefined,
        });
        expect(CSSLayer.get(meta, 'two'), 'two symbol').to.eql({
            _kind: 'layer',
            name: 'two',
            alias: 'two',
            global: false,
            import: undefined,
        });
        expect(CSSLayer.get(meta, 'with-rules'), 'with-rules symbol').to.eql({
            _kind: 'layer',
            name: 'with-rules',
            alias: 'with-rules',
            global: false,
            import: undefined,
        });
        expect(CSSLayer.get(meta, 'nested'), 'nested symbol').to.eql({
            _kind: 'layer',
            name: 'nested',
            alias: 'nested',
            global: false,
            import: undefined,
        });

        // JS exports
        expect(exports.layers).to.eql({
            single: 'entry__single',
            one: 'entry__one',
            two: 'entry__two',
            'with-rules': 'entry__with-rules',
            nested: 'entry__nested',
        });
    });
    it(`should mark as global`, () => {
        const { sheets } = testStylableCore(`
            /* @atrule(single) name */
            @layer st-global(name);

            /* @atrule(multi) entry__ns1, g1, entry__ns2, g2 */
            @layer ns1, st-global(g1), ns2, st-global(g2);
        `);

        const { meta, exports } = sheets['/entry.st.css'];

        shouldReportNoDiagnostics(meta);

        // symbols
        expect(CSSLayer.get(meta, `name`), `symbol`).to.eql({
            _kind: 'layer',
            alias: 'name',
            name: 'name',
            global: true,
            import: undefined,
        });
        expect(CSSLayer.get(meta, `ns1`), `symbol`).to.eql({
            _kind: 'layer',
            alias: 'ns1',
            name: 'ns1',
            global: false,
            import: undefined,
        });
        expect(CSSLayer.get(meta, `g1`), `symbol`).to.eql({
            _kind: 'layer',
            alias: 'g1',
            name: 'g1',
            global: true,
            import: undefined,
        });
        expect(CSSLayer.get(meta, `ns2`), `symbol`).to.eql({
            _kind: 'layer',
            alias: 'ns2',
            name: 'ns2',
            global: false,
            import: undefined,
        });
        expect(CSSLayer.get(meta, `g2`), `symbol`).to.eql({
            _kind: 'layer',
            alias: 'g2',
            name: 'g2',
            global: true,
            import: undefined,
        });

        // JS exports
        expect(exports.layers.name, `JS export`).to.eql(`name`);
    });
    it('should transform nested layers', () => {
        const { sheets } = testStylableCore(`           
            @layer L1 {
                @layer L2 {}
            }

            /* @atrule entry__L1.entry__L2 */
            @layer L1.L2 {}
        `);

        const { meta } = sheets['/entry.st.css'];

        shouldReportNoDiagnostics(meta);
    });
    it.skip('should combine global within nested layers', () => {
        const { sheets } = testStylableCore(`           
            /* @atrule entry__L1.L2.entry__L3 */
            @layer L1.st-global(L2).L2 {}
        `);

        const { meta } = sheets['/entry.st.css'];

        shouldReportNoDiagnostics(meta);
    });
    it('should report invalid cases', () => {
        const { sheets } = testStylableCore(`           
            /* 
                @analyze-warn(empty global) ${CSSLayer.diagnostics.MISSING_LAYER_NAME_INSIDE_GLOBAL()} 
                @atrule st-global()
            */
            @layer st-global() {}
            
            /* @analyze-error(multi block) ${CSSLayer.diagnostics.LAYER_SORT_STATEMENT_WITH_STYLE()} */
            @layer one, two {}
            
            /* 
                @analyze-error(reserved wide keywords) word(initial) ${CSSLayer.diagnostics.RESERVED_KEYWORD(
                    'initial'
                )}
                @atrule(reserved wide keywords) initial
            */
            @layer initial {}
                
            /* 
                @analyze-error(not ident) ${CSSLayer.diagnostics.NOT_IDENT('func()')}
                @atrule(not ident) func()
            */
            @layer func() {}
        `);

        const { meta } = sheets['/entry.st.css'];

        expect(meta.outputAst?.nodes[1]?.toString()).to.eql(`@layer st-global() {}`);
    });
    describe('st-import', () => {
        it('should resolve imported @layer', () => {
            const { sheets } = testStylableCore({
                '/imported.st.css': `
                    @layer layer1 {}
                    @layer layer2 {}
                `,
                '/entry.st.css': `
                    @st-import [layer(layer1, layer2 as local-layer)] from './imported.st.css';

                    /* @atrule(direct) imported__layer1 */
                    @layer layer1 {}

                    /* @atrule(mapped) imported__layer2 */
                    @layer local-layer {}
                `,
            });

            const { meta, exports } = sheets['/entry.st.css'];

            shouldReportNoDiagnostics(meta);

            // symbols
            expect(CSSLayer.get(meta, `layer1`), `layer1 symbol`).to.include({
                _kind: 'layer',
                name: 'layer1',
                alias: 'layer1',
                global: false,
                import: meta.getImportStatements()[0],
            });
            expect(CSSLayer.get(meta, `local-layer`), `local-layer symbol`).to.include({
                _kind: 'layer',
                name: 'layer2',
                alias: 'local-layer',
                global: false,
                import: meta.getImportStatements()[0],
            });

            // JS exports
            expect(exports.layers, `JS exports`).to.eql({
                layer1: `imported__layer1`,
                'local-layer': `imported__layer2`,
            });
        });
        it('should resolve imported global @layer', () => {
            const { sheets } = testStylableCore({
                '/imported.st.css': `
                    @layer st-global(layer1) {}
                    @layer st-global(layer2) {}
                `,
                '/entry.st.css': `
                    @st-import [layer(layer1, layer2 as local-layer)] from './imported.st.css';

                    /* @atrule(direct) layer1 */
                    @layer layer1 {}

                    /* @atrule(mapped) layer2 */
                    @layer local-layer {}
                `,
            });

            const { meta, exports } = sheets['/entry.st.css'];

            shouldReportNoDiagnostics(meta);

            // symbols
            expect(CSSLayer.get(meta, `layer1`), `layer1 symbol`).to.include({
                _kind: 'layer',
                name: 'layer1',
                alias: 'layer1',
                global: false,
                import: meta.getImportStatements()[0],
            });
            expect(CSSLayer.get(meta, `local-layer`), `local-layer symbol`).to.include({
                _kind: 'layer',
                name: 'layer2',
                alias: 'local-layer',
                global: false,
                import: meta.getImportStatements()[0],
            });

            // JS exports
            expect(exports.layers, `JS exports`).to.eql({
                layer1: `layer1`,
                'local-layer': `layer2`,
            });
        });
        it('should report unknown @layer import', () => {
            const { sheets } = testStylableCore({
                '/imported.st.css': ``,
                '/entry.st.css': `
                    /* @transform-error word(unknown) ${CSSLayer.diagnostics.UNKNOWN_IMPORTED_LAYER(
                        `unknown`,
                        `./imported.st.css`
                    )} */
                    @st-import [layer(unknown as local)] from './imported.st.css';
                `,
            });

            const { meta, exports } = sheets['/entry.st.css'];

            // symbols
            expect(CSSLayer.get(meta, `local`), `symbol`).to.include({
                _kind: 'layer',
                name: 'unknown',
                alias: 'local',
                global: false,
                import: meta.getImportStatements()[0],
            });

            // JS exports
            expect(exports.layers, `JS exports`).to.eql({});
        });
        it('should transform nested layers', () => {
            const { sheets } = testStylableCore({
                '/imported.st.css': `
                    @layer L1 {}
                `,
                '/entry.st.css': `
                    @st-import [layer(L1)] from './imported.st.css';

                    @layer L2 {}

                    /* @atrule(direct) imported__L1.entry__L2 */
                    @layer L1.L2 {}
                `,
            });

            const { meta } = sheets['/entry.st.css'];

            shouldReportNoDiagnostics(meta);
        });
        it('should report imported @layer override attempt', () => {
            const { sheets } = testStylableCore({
                '/imported.st.css': `
                    @layer L1 {}
                `,
                '/entry.st.css': `
                    @st-import [layer(L1)] from './imported.st.css';

                    /* 
                        @analyze-error word(L1) ${CSSLayer.diagnostics.RECONFIGURE_IMPORTED('L1')} 
                        @atrule imported__L1
                    */
                    @layer st-global(L1) {}
                `,
            });

            const { meta, exports } = sheets['/entry.st.css'];

            // symbols
            expect(CSSLayer.get(meta, `L1`), `symbol`).to.include({
                _kind: 'layer',
                name: 'L1',
                alias: 'L1',
                global: false,
                import: meta.getImportStatements()[0],
            });

            // JS exports
            expect(exports.layers, `JS exports`).to.eql({
                L1: `imported__L1`,
            });
        });
    });
    describe('st-mixin', () => {
        it('should mix @layer for nested mixin', () => {
            const { sheets } = testStylableCore(
                deindent(`
                @layer x {
                    .before { id: before-in-layer; }
                    .mix { id: mix-in-layer; }
                    .after { id: after-in-layer; }
                }

                .into {
                    -st-mixin: mix;
                }
            `)
            );

            const { meta } = sheets['/entry.st.css'];

            shouldReportNoDiagnostics(meta);

            expect(meta.outputAst?.toString()).to.eql(
                deindent(`
                @layer entry__x {
                    .entry__before { id: before-in-layer; }
                    .entry__mix { id: mix-in-layer; }
                    .entry__after { id: after-in-layer; }
                }
                 .entry__into {
                }
                 @layer entry__x {
                    .entry__into { id: mix-in-layer; }
                }
            `)
            );
        });
    });
    describe('css-import', () => {
        it.skip('transform native @import', () => {
            const { sheets } = testStylableCore(`
                /* atrule(named) url("button.css") layer(entry__base) */
                @import url("button.css") layer(base);
                
                /* atrule(unnamed) url("other.css") layer() */
                @import url("other.css") layer();
            `);

            const { meta } = sheets['/entry.st.css'];

            shouldReportNoDiagnostics(meta);

            // symbols
            expect(CSSLayer.get(meta, 'base'), 'symbol').to.eql({
                _kind: 'layer',
                name: 'base',
                alias: 'base',
                global: false,
                import: undefined,
            });

            // JS exports
            expect(exports.layer).to.eql({
                base: 'entry__base',
            });
        });
        it.skip('should not allow between @import rules', () => {
            testStylableCore(`
                @import url(before.css) layer(before);
                /* analyze-error not allowed between @import statements */
                @layer between;
                @import url(after.css) layer(after);
            `);
        });
    });
});
