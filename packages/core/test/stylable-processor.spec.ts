import { resolve } from 'path';
import chai, { expect } from 'chai';
import { flatMatch, processSource } from '@stylable/core-test-kit';
import { processNamespace } from '@stylable/core';
import { knownPseudoClassesWithNestedSelectors } from '@stylable/core/dist/index-internal';

chai.use(flatMatch);

describe('Stylable postcss process', () => {
    it('report if missing filename', () => {
        const { diagnostics, namespace } = processSource(``);
        expect(namespace).to.equal('s0');
        expect(diagnostics.reports[0]).to.include({
            severity: 'error',
            message: 'missing source filename',
        });
    });

    it('use filename as default namespace prefix (empty)', () => {
        const from = resolve('/path/to/style.css');

        const result = processSource(
            `

        `,
            { from }
        );

        expect(result.namespace).to.eql(processNamespace('style', from));
    });

    it('collect typed classes extends', () => {
        const result = processSource(
            `
            :import {
                -st-from: './file.st.css';
                -st-default: Style;
            }
            .myclass {
                -st-extends: Style;
            }
        `,
            { from: 'path/to/style.st.css' }
        );

        expect(result.diagnostics.reports.length, 'no reports').to.eql(0);

        expect(result.getAllClasses()).to.flatMatch({
            myclass: {
                '-st-extends': {
                    _kind: 'import',
                    type: 'default',
                    import: {
                        // from: '/path/to/file.css',
                        request: './file.st.css',
                        defaultExport: 'Style',
                    },
                },
            },
        });
    });

    it('should not collect typed elements or classes in unknown functional selectors', () => {
        const result = processSource(
            `
            :unknown(Unknown.unknown) {}
            :nth-of-type(5n, NthOfType.nth-of-type) {}
            :nth-last-of-type(5n, NthLastOfType.nth-last-of-type) {}
            ${knownPseudoClassesWithNestedSelectors
                .map((name) =>
                    name.startsWith(`nth`)
                        ? `:${name}(5n, El-${name}.cls-${name}) {}`
                        : `:${name}(El-${name}.cls-${name}) {}`
                )
                .join(``)}
        `,
            { from: 'path/to/style.st.css' }
        );

        // unknown pseudo-class
        expect(result.getSymbol(`Unknown`)).to.equal(undefined);
        expect(result.getClass(`unknown`)).to.equal(undefined);
        // native with ignored or no nested classes
        expect(result.getSymbol(`NthOfType`)).to.equal(undefined);
        expect(result.getClass(`nth-of-type`)).to.equal(undefined);
        expect(result.getSymbol(`NthLastOfType`)).to.equal(undefined);
        expect(result.getClass(`nth-last-of-type`)).to.equal(undefined);
        // known function pseudo-classes with nested selectors
        for (const name of knownPseudoClassesWithNestedSelectors) {
            expect(result.getSymbol(`El-${name}`)).to.not.equal(undefined);
            expect(result.getClass(`cls-${name}`)).to.not.equal(undefined);
        }
    });

    it('always contain root class', () => {
        const result = processSource(
            `

        `,
            { from: 'path/to/style.st.css' }
        );

        expect(result.getAllClasses()).to.eql({
            root: {
                _kind: 'class',
                name: 'root',
                '-st-root': true,
                alias: undefined,
            },
        });
    });

    it('collect classes', () => {
        const result = processSource(
            `
            .root{}
            .classA{}
            .classB, .classC, .classA{}
            :not(.classD){}
            .classE:hover{}
        `,
            { from: 'path/to/style.st.css' }
        );

        expect(Object.keys(result.getAllClasses()).length).to.eql(6);
    });

    it('collect classes in @media', () => {
        const result = processSource(
            `
            @media (max-width: 300px) {
                .root{}
                .classA{}
                .classB, .classC{}
                :not(.classD){}
                .classE:hover{}
            }
        `,
            { from: 'path/to/style.st.css' }
        );

        expect(Object.keys(result.getAllClasses()).length).to.eql(6);
    });

    describe('process assets', () => {
        it('should collect url assets from :vars', () => {
            const result = processSource(
                `
                :vars {
                    img: url('./x.svg');
                }
            `,
                { from: 'path/to/style.st.css' }
            );

            expect(result.urls.length).to.eql(1);
        });
    });
});
