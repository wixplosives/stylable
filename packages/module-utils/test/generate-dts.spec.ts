import { DTSKit } from '@stylable/e2e-test-kit';
import { expect } from 'chai';

const propUnknownNotOnType = "Property 'unknown' does not exist on type";
const propNotOnType = (name: string) => `Property '${name}' does not exist on type`;

describe('Generate DTS', function () {
    this.timeout(25000);
    let tk: DTSKit;

    beforeEach(() => {
        tk = new DTSKit();
    });

    afterEach(() => {
        tk.dispose();
    });

    it('should generate classes .d.ts', () => {
        tk.populate({
            'test.st.css': '.root{}',
            'test.ts': `
                import { eq } from "./test-kit";
                import { classes } from "./test.st.css";
                
                eq<"test__root">(classes.root);
            `,
        });

        expect(tk.typecheck('test.ts')).to.equal('');
    });

    it('should warn on non-existing classes', () => {
        tk.populate({
            'test.st.css': '.root{}',
            'test.ts': `
                import { eq } from "./test-kit";
                import { classes } from "./test.st.css";
                
                eq<"test__root">(classes.unknown);
            `,
        });

        expect(tk.typecheck('test.ts')).to.include(propUnknownNotOnType);
    });

    it('should generate CSS var .d.ts', () => {
        tk.populate({
            'test.st.css': '.root { --c1: green; }',
            'test.ts': `
                import { eq } from "./test-kit";
                import { vars } from "./test.st.css";
                
                eq<string>(vars.c1);
            `,
        });

        expect(tk.typecheck('test.ts')).to.equal('');
    });

    it('should warn about non-existing CSS vars', () => {
        tk.populate({
            'test.st.css': '.root { --c1: green; }',
            'test.ts': `
                import { eq } from "./test-kit";
                import { vars } from "./test.st.css";
                
                eq<string>(vars.unknown);
            `,
        });

        expect(tk.typecheck('test.ts')).to.include(propUnknownNotOnType);
    });

    it('should generate Stylable var .d.ts', () => {
        tk.populate({
            'test.st.css': ':vars {c1: green;}',
            'test.ts': `
                import { eq } from "./test-kit";
                import { stVars } from "./test.st.css";
                
                eq<string>(stVars.c1);
            `,
        });

        expect(tk.typecheck('test.ts')).to.equal('');
    });

    it('should generate complex Stylable var .d.ts', () => {
        tk.populate({
            'test.st.css': `
                :vars {
                    a: st-map(
                        b st-array(red, blue, st-map(d green)),
                        c gold,
                    )
                }
              `,
            'test.ts': `
                import { eq } from "./test-kit";
                import { stVars } from "./test.st.css";
                
                eq<{
                    b: [
                        string, 
                        string, 
                        {
                            d: string;
                        }
                    ];
                    c: string;
                }>(stVars.a);
            `,
        });

        expect(tk.typecheck('test.ts')).to.equal('');
    });

    it('should warn about non-existing Stylable var', () => {
        tk.populate({
            'test.st.css': ':vars {c1: green;}',
            'test.ts': `
                import { eq } from "./test-kit";
                import { stVars } from "./test.st.css";
                
                eq<string>(stVars.unknown);
            `,
        });

        expect(tk.typecheck('test.ts')).to.include(propUnknownNotOnType);
    });

    it('should generate keyframes .d.ts', () => {
        tk.populate({
            'test.st.css': '@keyframes k1 {0% {} 100% {}}',
            'test.ts': `
                import { eq } from "./test-kit";
                import { keyframes } from "./test.st.css";
                
                eq<string>(keyframes.k1);
            `,
        });

        expect(tk.typecheck('test.ts')).to.equal('');
    });

    it('should warn about non-existing keyframes', () => {
        tk.populate({
            'test.st.css': '@keyframes k1 {0% {} 100% {}}',
            'test.ts': `
                import { eq } from "./test-kit";
                import { keyframes } from "./test.st.css";
                
                eq<string>(keyframes.unknown);
            `,
        });

        expect(tk.typecheck('test.ts')).to.include(propUnknownNotOnType);
    });

    it('should generate layers .d.ts', () => {
        tk.populate({
            'test.st.css': '@layer layerA, layerB',
            'test.ts': `
                import { eq } from "./test-kit";
                import { layers } from "./test.st.css";
                
                eq<string>(layers.layerA);
                eq<string>(layers.layerB);
            `,
        });

        expect(tk.typecheck('test.ts')).to.equal('');
    });

    it('should warn about non-existing layers', () => {
        tk.populate({
            'test.st.css': '@layers someLayer',
            'test.ts': `
                import { eq } from "./test-kit";
                import { layers } from "./test.st.css";
                
                eq<string>(layers.unknown);
            `,
        });

        expect(tk.typecheck('test.ts')).to.include(propUnknownNotOnType);
    });

    it('should generate containers .d.ts', () => {
        tk.populate({
            'test.st.css': '.a { container: conA conB; }',
            'test.ts': `
                import { eq } from "./test-kit";
                import { containers } from "./test.st.css";
                
                eq<string>(containers.conA);
                eq<string>(containers.conB);
            `,
        });

        expect(tk.typecheck('test.ts')).to.equal('');
    });

    it('should warn about non-existing containers', () => {
        tk.populate({
            'test.st.css': '.a { container: conA conB; }',
            'test.ts': `
                import { eq } from "./test-kit";
                import { containers } from "./test.st.css";
                
                eq<string>(containers.unknown);
            `,
        });

        expect(tk.typecheck('test.ts')).to.include(propUnknownNotOnType);
    });

    it('should not expose imported symbols', () => {
        tk.populate({
            'origin.st.css': `
                .cls { 
                    container-name: cont;
                }
                @property --customProp;
                :vars {
                    buildVar: red;
                }
                @keyframes anim {}
                @layer layer1 {}
            `,
            'test.st.css': `
                @st-import CompRoot, [
                    cls,
                    --customProp,
                    buildVar,
                    keyframes(anim),
                    container(cont),
                    layer(layer1),
                ] from './origin.st.css';
                .cls { color: value(buildVar); }
                .CompRoot { 
                    color: green;
                    --customProp: green;
                    animation: anim;
                }
                @container cont (inline-size > 1px) {}
                @layer layer1 {}
            `,
            'test.ts': `
                import { eq } from "./test-kit";
                import { classes, vars, stVars, keyframes, containers, layers } from "./test.st.css";
                
                eq<string>(classes.cls);
                eq<string>(classes.CompRoot);
                eq<string>(vars.customProp);
                eq<string>(stVars.buildVar);
                eq<string>(keyframes.anim);
                eq<string>(containers.cont);
                eq<string>(layers.layer1);
            `,
        });

        expect(tk.typecheck('test.ts')).to.include(propNotOnType('cls'));
        expect(tk.typecheck('test.ts')).to.include(propNotOnType('CompRoot'));
        expect(tk.typecheck('test.ts')).to.include(propNotOnType('customProp'));
        expect(tk.typecheck('test.ts')).to.include(propNotOnType('buildVar'));
        expect(tk.typecheck('test.ts')).to.include(propNotOnType('anim'));
        expect(tk.typecheck('test.ts')).to.include(propNotOnType('cont'));
        expect(tk.typecheck('test.ts')).to.include(propNotOnType('layer1'));
    });

    describe('st function', () => {
        it('should support basic usage with root class', () => {
            tk.populate({
                'test.st.css': '.root {}',
                'test.ts': `
                    import { eq } from "./test-kit";
                    import { st, classes } from "./test.st.css";
                    
                    eq<string>(st(classes.root));
                `,
            });

            expect(tk.typecheck('test.ts')).to.equal('');
        });

        it('should support st as an alias of the style function', () => {
            tk.populate({
                'test.st.css': '.root {}',
                'test.ts': `
                    import { st, style } from "./test.st.css";
                    
                    const ST: typeof st = style;
                `,
            });

            expect(tk.typecheck('test.ts')).to.equal('');
        });

        it('should accept any string', () => {
            tk.populate({
                'test.st.css': '.root {}',
                'test.ts': `
                    import { eq } from "./test-kit";
                    import { st } from "./test.st.css";
                    
                    eq<string>(st('str1', 'str2'));
                `,
            });

            expect(tk.typecheck('test.ts')).to.equal('');
        });

        it('should support st second argument as state', () => {
            tk.populate({
                'test.st.css': '.root { -st-states: state1; }',
                'test.ts': `
                    import { eq } from "./test-kit";
                    import { st, classes } from "./test.st.css";
                    
                    eq<string>(st(classes.root, { state1: true }, 'someClass'));
                `,
            });

            expect(tk.typecheck('test.ts')).to.equal('');
        });

        it('should support st second argument as class', () => {
            tk.populate({
                'test.st.css': '.root { -st-states: state1; }',
                'test.ts': `
                    import { eq } from "./test-kit";
                    import { st, classes } from "./test.st.css";
                    
                    eq<string>(st(classes.root, 'someClass', 'someOtherClass'));
                `,
            });

            expect(tk.typecheck('test.ts')).to.equal('');
        });

        it('should support states through local extend', () => {
            tk.populate({
                'test.st.css': '.local { -st-states: state1; } .test { -st-extends: local; }',
                'test.ts': `
                    import { eq } from "./test-kit";
                    import { st, classes } from "./test.st.css";
                    
                    eq<string>(st(classes.test, { state1: true }));
                `,
            });

            expect(tk.typecheck('test.ts')).to.equal('');
        });

        it('should support states through local extend (deep)', () => {
            tk.populate({
                'test.st.css':
                    '.deepest { -st-states: state2; } .deep { -st-states: state1; -st-extends: deepest; } .test { -st-extends: deep; }',
                'test.ts': `
                    import { eq } from "./test-kit";
                    import { st, classes } from "./test.st.css";
                    
                    eq<string>(st(classes.test, { state1: true, state2: true }));
                `,
            });

            expect(tk.typecheck('test.ts')).to.equal('');
        });

        it('should warn on non-existing state', () => {
            tk.populate({
                'test.st.css': '.root {}',
                'test.ts': `
                    import { st, classes } from "./test.st.css";
                    
                    st(classes.root, { state1: true });
                `,
            });

            expect(tk.typecheck('test.ts')).to.include(
                "Argument of type '{ state1: boolean; }' is not assignable",
            );
        });

        it('should warn on type mis-match in state', () => {
            tk.populate({
                'test.st.css': '.root { -st-states: state1; }',
                'test.ts': `
                    import { st, classes } from "./test.st.css";
                    
                    st(classes.root, { state1: 'str' });
                `,
            });

            expect(tk.typecheck('test.ts')).to.include(
                "Type 'string' is not assignable to type 'boolean | undefined'",
            );
        });

        it('should warn on type mis-match in multiple states', () => {
            tk.populate({
                'test.st.css': `.root { -st-states: state1; }
                .part { -st-states: state1(string); }`,
                'test.ts': `
                    import { st, classes } from "./test.st.css";
                    
                    st(classes.root, { state1: 'str' });
                    st(classes.part, { state1: true });
                `,
            });

            const diagnostics = tk.typecheck('test.ts');
            expect(diagnostics).to.include(
                "Type 'string' is not assignable to type 'boolean | undefined'",
            );
            // changing error message to comply with typescript v4.6
            // https://github.com/microsoft/TypeScript/issues/48083
            expect(diagnostics).to.include("Type 'boolean' is not assignable to type 'string'");
        });

        it('should warn on mapped state', () => {
            tk.populate({
                'test.st.css': '.root { -st-states: mapped("[abc]"); }',
                'test.ts': `
                    import { st, classes } from "./test.st.css";
                    
                    st(classes.root, { mapped: 'paramVal' });
                `,
            });
            expect(tk.typecheck('test.ts')).to.include(
                "Argument of type '{ mapped: string; }' is not assignable",
            );
        });

        it('should warn on mapped state accepts a param', () => {
            tk.populate({
                'test.st.css': '.root { -st-states: mappedWithParam("$0", string); }',
                'test.ts': `
                    import { st, classes } from "./test.st.css";
                    
                    st(classes.root, { mappedWithParam: 'paramVal' });
                `,
            });
            expect(tk.typecheck('test.ts')).to.include(
                "Argument of type '{ mappedWithParam: string; }' is not assignable",
            );
        });

        describe('state overrides', () => {
            it('should support states overridden through a local extend', () => {
                tk.populate({
                    'test.st.css':
                        '.base { -st-states: state1; } .test { -st-states: state1(string); -st-extends: base; }',
                    'test.ts': `
                        import { eq } from "./test-kit";
                        import { st, classes } from "./test.st.css";
                        
                        eq<string>(st(classes.test, { state1: 'hello' }));
                    `,
                });

                expect(tk.typecheck('test.ts')).to.equal('');
            });

            it('should warn about when an extended, overridden state value is of an incorrect type', () => {
                tk.populate({
                    'test.st.css':
                        '.base { -st-states: state1; } .test { -st-states: state1(string); -st-extends: base; }',
                    'test.ts': `
                        import { eq } from "./test-kit";
                        import { st, classes } from "./test.st.css";
                        
                        eq<string>(st(classes.test, { state1: true }));
                    `,
                });

                // changing error message to comply with typescript v4.6
                // https://github.com/microsoft/TypeScript/issues/48083
                expect(tk.typecheck('test.ts')).to.include(
                    `Type 'boolean' is not assignable to type 'string'`,
                );
            });

            it('should not warn when an extended, overridden state value is of a correct type', () => {
                tk.populate({
                    'test.st.css':
                        '.base { -st-states: state1(string); } .test { -st-states: state1(string); -st-extends: base; }',
                    'test.ts': `
                        import { eq } from "./test-kit";
                        import { st, classes } from "./test.st.css";
                        
                        eq<string>(st(classes.test, { state1: 'hello' }));
                    `,
                });

                expect(tk.typecheck('test.ts')).to.equal('');
            });

            it('should warn about setting a state that extends with a mapped', () => {
                tk.populate({
                    'test.st.css':
                        '.base { -st-states: state1; } .test { -st-states: state1(".abc"); -st-extends: base; }',
                    'test.ts': `
                        import { eq } from "./test-kit";
                        import { st, classes } from "./test.st.css";
                        
                        eq<string>(st(classes.test, { state1: 'value' }));
                    `,
                });

                expect(tk.typecheck('test.ts')).to.include(
                    "Argument of type '{ state1: string; }' is not assignable",
                );
            });

            it('should warn about setting a state that extends with a mapped (with param)', () => {
                tk.populate({
                    'test.st.css':
                        '.base { -st-states: state1; } .test { -st-states: state1(".$0", string); -st-extends: base; }',
                    'test.ts': `
                        import { eq } from "./test-kit";
                        import { st, classes } from "./test.st.css";
                        
                        eq<string>(st(classes.test, { state1: 'value' }));
                    `,
                });

                expect(tk.typecheck('test.ts')).to.include(
                    "Argument of type '{ state1: string; }' is not assignable",
                );
            });

            it('should warn about state override from imported extend', () => {
                // inherited state overrides only work in the same stylesheet
                tk.populate({
                    'base.st.css': '.part {stStates: state1}',
                    'test.st.css': `
                        @st-import [part] from './base.st.css';
                        .test { -st-extends: part; }`,
                    'test.ts': `
                        import { eq } from "./test-kit";
                        import { st, classes } from "./test.st.css";
                        
                        eq<string>(st(classes.test, { state1: true }));
                    `,
                });

                expect(tk.typecheck('test.ts')).to.include(
                    `Argument of type '{ state1: boolean; }' is not assignable to parameter of type 'NullableString'`,
                );
            });
        });
    });

    describe('cssStates', () => {
        it('should support basic usage', () => {
            tk.populate({
                'test.st.css': '.root { -st-states: state1; }',
                'test.ts': `
                    import { eq } from "./test-kit";
                    import { cssStates } from "./test.st.css";
                    
                    eq<string>(cssStates({ state1: true }));
                `,
            });

            expect(tk.typecheck('test.ts')).to.equal('');
        });

        it('should warn on non-existing states', () => {
            tk.populate({
                'test.st.css': '.root { -st-states: state1; }',
                'test.ts': `
                    import { cssStates } from "./test.st.css";
                    
                    cssStates({ unknown: true });
                `,
            });

            expect(tk.typecheck('test.ts')).to.include(
                "only specify known properties, and 'unknown' does not exist in type",
            );
        });

        it('should warn on type mis-match in states', () => {
            tk.populate({
                'test.st.css': '.root { -st-states: state1; }',
                'test.ts': `
                    import { cssStates } from "./test.st.css";
                    
                    cssStates({ state1: 'str' });
                `,
            });

            expect(tk.typecheck('test.ts')).to.include("Type 'string' is not assignable to type");
        });
    });
});
