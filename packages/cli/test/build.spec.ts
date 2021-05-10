import { expect } from 'chai';
import {
    Stylable,
    functionWarnings,
    processorWarnings,
    resolverWarnings,
    murmurhash3_32_gc,
} from '@stylable/core';
import { build } from '@stylable/cli';
import { createMemoryFs } from '@file-services/memory';

const log = () => {
    /**/
};

describe('build stand alone', () => {
    it('should create modules and copy source css files', async () => {
        const fs = createMemoryFs({
            '/main.st.css': `
                :import{
                    -st-from: "./components/comp.st.css";
                    -st-default:Comp;
                }
                .gaga{
                    -st-extends:Comp;
                    color:blue;
                }
            `,
            '/components/comp.st.css': `
                .baga{
                    color:red;
                }
            `,
        });

        const stylable = new Stylable('/', fs, () => ({}));

        await build({
            extension: '.st.css',
            fs,
            stylable,
            outDir: 'lib',
            srcDir: '.',
            rootDir: '/',
            log,
            moduleFormats: ['cjs'],
            outputSources: true,
        });

        [
            '/lib/main.st.css',
            '/lib/main.st.css.js',
            '/lib/components/comp.st.css',
            '/lib/components/comp.st.css.js',
        ].forEach((p) => {
            expect(fs.existsSync(p), p).to.equal(true);
        });

        // assure no index file was generated by default
        expect(fs.existsSync('/lib/index.st.css'), '/lib/index.st.css').to.equal(false);
    });

    it('should use "useNamespaceReference" to maintain a single namespace for all builds using it', async () => {
        const fs = createMemoryFs({
            '/src/main.st.css': `
                :import{
                    -st-from: "./components/comp.st.css";
                    -st-default:Comp;
                }
                .gaga{
                    -st-extends:Comp;
                    color:blue;
                }
            `,
            '/src/components/comp.st.css': `
                .baga{
                    color:red;
                }
            `,
        });

        const stylable = Stylable.create({
            projectRoot: '/',
            fileSystem: fs,
            resolveNamespace(n, s) {
                const normalizedWindowsRoot = fs.relative(
                    '/',
                    s.replace(/^\w:\\/, '/').replace('\\', '/')
                );
                return n + murmurhash3_32_gc(normalizedWindowsRoot);
            },
        });

        await build({
            extension: '.st.css',
            fs,
            stylable,
            rootDir: '/',
            srcDir: 'src',
            outDir: 'cjs',
            log,
            moduleFormats: ['cjs'],
            outputSources: true,
            useSourceNamespace: true,
        });

        [
            '/cjs/main.st.css',
            '/cjs/main.st.css.js',
            '/cjs/components/comp.st.css',
            '/cjs/components/comp.st.css.js',
        ].forEach((p) => {
            expect(fs.existsSync(p), p).to.equal(true);
        });

        expect(fs.readFileSync('/cjs/main.st.css', 'utf-8')).to.include(
            'st-namespace-reference="../src/main.st.css"'
        );

        await build({
            extension: '.st.css',
            fs,
            stylable,
            rootDir: '/',
            srcDir: 'cjs',
            outDir: 'cjs2',
            log,
            moduleFormats: ['cjs'],
        });

        // check two builds using sourceNamespace are identical
        // compare two serializable js modules including their namespace
        expect(fs.readFileSync('/cjs/main.st.css.js', 'utf-8')).to.equal(
            fs.readFileSync('/cjs2/main.st.css.js', 'utf-8')
        );
    });

    it('should report errors originating from stylable (process + transform)', async () => {
        const fs = createMemoryFs({
            '/comp.st.css': `
                :import {
                    -st-from: "./missing-file.st.css";
                    -st-default: OtherMissingComp;
                }

                .a {
                    -st-extends: MissingComp;
                    color: value(missingVar);
                }
            `,
        });

        const stylable = new Stylable('/', fs, () => ({}));

        const { diagnosticsMessages } = await build({
            extension: '.st.css',
            fs,
            stylable,
            outDir: '.',
            srcDir: '.',
            rootDir: '/',
            log,
            moduleFormats: ['cjs'],
        });
        const messages = diagnosticsMessages.get('/comp.st.css')!;

        expect(messages[0]).to.contain(processorWarnings.CANNOT_RESOLVE_EXTEND('MissingComp'));
        expect(messages[1]).to.contain(
            resolverWarnings.UNKNOWN_IMPORTED_FILE('./missing-file.st.css')
        );
        expect(messages[2]).to.contain(functionWarnings.UNKNOWN_VAR('missingVar'));
    });

    it('should optimize css (remove empty nodes, remove stylable-directives, remove comments)', async () => {
        const fs = createMemoryFs({
            '/comp.st.css': `
                .root {
                    color: red;
                }
                /* comment */
                .x {
                    
                }
            `,
        });

        const stylable = new Stylable('/', fs, () => ({}));

        await build({
            extension: '.st.css',
            fs,
            stylable,
            outDir: './dist',
            srcDir: '.',
            rootDir: '/',
            log,
            moduleFormats: ['cjs'],
            outputCSS: true,
            outputCSSNameTemplate: '[filename].global.css',
        });

        const builtFile = fs.readFileSync('/dist/comp.global.css', 'utf8');

        expect(builtFile).to.contain(`root {`);
        expect(builtFile).to.contain(`color: red;`);
        expect(builtFile).to.not.contain(`.x`);
    });

    it('should minify', async () => {
        const fs = createMemoryFs({
            '/comp.st.css': `
                .root {
                    color: rgb(255,0,0);
                }
            `,
        });

        const stylable = Stylable.create({
            projectRoot: '/',
            fileSystem: fs,
            resolveNamespace() {
                return 'test';
            },
        });

        await build({
            extension: '.st.css',
            fs,
            stylable,
            outDir: './dist',
            srcDir: '.',
            minify: true,
            rootDir: '/',
            log,
            moduleFormats: ['cjs'],
            outputCSS: true,
            outputCSSNameTemplate: '[filename].global.css',
        });

        const builtFile = fs.readFileSync('/dist/comp.global.css', 'utf8');

        expect(builtFile).to.contain(`.test__root{color:red}`);
    });

    it('should inject request to output module', async () => {
        const fs = createMemoryFs({
            '/comp.st.css': `
                .root {
                    color: red;
                }
            `,
        });

        const stylable = new Stylable('/', fs, () => ({}));

        await build({
            extension: '.st.css',
            fs,
            stylable,
            outDir: './dist',
            srcDir: '.',
            rootDir: '/',
            log,
            moduleFormats: ['cjs'],
            outputCSS: true,
            injectCSSRequest: true,
            outputCSSNameTemplate: '[filename].global.css',
        });

        expect(fs.readFileSync('/dist/comp.st.css.js', 'utf8')).contains(
            `require("./comp.global.css")`
        );
        expect(fs.existsSync('/dist/comp.global.css')).to.equal(true);
    });
});
