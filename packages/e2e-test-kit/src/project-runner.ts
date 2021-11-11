// if you move this file change #1.
import { join, normalize } from 'path';
import playwright from 'playwright-core';
import rimrafCallback from 'rimraf';
import { promisify } from 'util';
import webpack from 'webpack';
import { nodeFs } from '@file-services/node';
import { symlinkSync, existsSync, realpathSync } from 'fs';
import { deferred } from 'promise-assist';
import { runServer } from './run-server';
import { createTempDirectorySync } from 'create-temp-directory';

export interface Options {
    projectDir: string;
    port?: number;
    launchOptions: playwright.LaunchOptions;
    webpackOptions?: webpack.Configuration;
    throwOnBuildError?: boolean;
    configName?: string;
    log?: boolean;
    watchMode?: boolean;
    useTempDir?: boolean;
    tempDirPath?: string;
}

type MochaHook = import('mocha').HookFunction;
type Assets = Record<string, { source(): string; emitted: boolean; distPath: string }>;
const rimraf = promisify(rimrafCallback);

export class ProjectRunner {
    public static mochaSetup(
        runnerOptions: Options,
        before: MochaHook,
        afterEach: MochaHook,
        after: MochaHook
    ) {
        const projectRunner = new this(runnerOptions);

        before('bundle and serve project', async function () {
            this.timeout(40000);
            await projectRunner.run();
            await projectRunner.serve();
        });

        afterEach('cleanup open pages', async () => {
            await projectRunner.closeAllPages();
        });

        after('destroy runner', async () => {
            await projectRunner.destroy();
        });

        return projectRunner;
    }
    public testDir!: string;
    public outputDir!: string;
    private tempPath?: string;
    public browserContext?: playwright.BrowserContext;
    public stats: webpack.Stats | null | undefined = undefined;
    public serverUrl = `http://localhost:${this.options.port}`;
    public log = this.options.log ? console.log.bind(console, '[ProjectRunner]') : () => void 0;
    public server?: { close(): void } | null;
    public browser?: playwright.Browser | null;
    public compiler?: webpack.Compiler | null;
    public watchingHandle?: ReturnType<webpack.Compiler['watch']> | null;
    public doneListeners = new Set<() => void>();
    constructor(public options: Options) {}
    public run() {
        this.prepareTestDirectory();
        return this.options.watchMode ? this.watch() : this.bundle();
    }
    public async bundle() {
        this.log('Bundle Start');
        const webpackConfig = this.loadWebpackConfig();
        const compiler = webpack(webpackConfig);
        this.compiler = compiler;
        // compiler.run = compiler.run.bind(compiler);
        const run = () => {
            return new Promise<webpack.Stats | undefined>((res, rej) =>
                compiler.run((err, stats) => (err ? rej(err) : res(stats)))
            );
        };
        this.stats = await run();
        if (this.options.throwOnBuildError && this.stats?.hasErrors()) {
            throw new Error(this.stats.toString({ colors: true }));
        }
        this.log('Bundle Finished');
    }
    public async watch() {
        this.log('Watch Start');
        const webpackConfig = this.loadWebpackConfig();
        const compiler = webpack(webpackConfig);
        this.compiler = compiler;

        const firstCompile = deferred<webpack.Stats>();

        this.watchingHandle = compiler.watch({}, (err, stats) => {
            if (!this.stats) {
                if (this.options.throwOnBuildError && stats?.hasErrors()) {
                    err = new Error(stats?.compilation.errors.join('\n'));
                }
                if (err) {
                    firstCompile.reject(err);
                } else {
                    firstCompile.resolve(stats);
                }
            }
            this.stats = stats;
        });

        compiler.hooks.done.tap('waitForRecompile', () => {
            this.doneListeners.forEach((listener) => listener());
        });

        await firstCompile.promise;
        this.log('Finished Initial Compile');
    }
    public async serve() {
        const { server, serverUrl } = await runServer(this.outputDir, this.options.port, this.log);
        this.serverUrl = serverUrl;
        this.server = server;
    }
    public waitForRecompile() {
        return new Promise<void>((res, rej) => {
            if (!this.compiler) {
                return rej();
            }
            const handler = () => {
                this.doneListeners.delete(handler);
                res();
            };
            this.doneListeners.add(handler);
        });
    }
    public async actAndWaitForRecompile(
        actionDesc: string,
        action: () => Promise<void> | void,
        validate: () => Promise<void> | void = () => Promise.resolve()
    ) {
        try {
            const recompile = this.waitForRecompile();
            await action();
            await recompile;
            await validate();
        } catch (e) {
            if (e) {
                (e as Error).message = actionDesc + '\n' + (e as Error).message;
            }
            throw e;
        }
    }
    public async openInBrowser() {
        if (!this.browser) {
            this.browser = await playwright.chromium.launch(this.options.launchOptions);
        }
        if (!this.browserContext) {
            this.browserContext = await this.browser.newContext();
        }

        const page = await this.browserContext.newPage();

        const responses: playwright.Response[] = [];
        page.on('response', (response) => responses.push(response));
        await page.goto(this.serverUrl, { waitUntil: 'networkidle' });
        return { page, responses };
    }
    public getBuildWarningMessages(): webpack.Compilation['warnings'] {
        return this.stats!.compilation.warnings.slice();
    }
    public getBuildErrorMessages(): webpack.Compilation['errors'] {
        return this.stats!.compilation.errors.slice();
    }
    public getBuildErrorMessagesDeep() {
        function getErrors(compilations: webpack.Compilation[]) {
            return compilations.reduce((errors, compilation) => {
                errors.push(...compilation.errors);
                errors.push(...getErrors(compilation.children));
                return errors;
            }, [] as any[]);
        }

        return getErrors([this.stats!.compilation]);
    }
    public getBuildWarningsMessagesDeep() {
        function getWarnings(compilations: webpack.Compilation[]) {
            return compilations.reduce((warnings, compilation) => {
                warnings.push(...compilation.warnings);
                warnings.push(...getWarnings(compilation.children));
                return warnings;
            }, [] as any[]);
        }

        return getWarnings([this.stats!.compilation]);
    }
    public getBuildAsset(assetPath: string) {
        return nodeFs.readFileSync(
            join(this.stats?.compilation.options.output.path || '', normalize(assetPath)),
            'utf-8'
        );
    }
    public getBuildAssets(): Assets {
        return Object.keys(this.stats!.compilation.assets).reduce<Assets>((acc, assetPath) => {
            acc[assetPath] = {
                distPath: join(
                    this.stats?.compilation.options.output.path || '',
                    normalize(assetPath)
                ),
                source() {
                    return nodeFs.readFileSync(this.distPath, 'utf8');
                },
                get emitted() {
                    return nodeFs.existsSync(this.distPath);
                },
            };
            return acc;
        }, {});
    }
    public evalAssetModule(source: string, publicPath = ''): any {
        const _module = { exports: {} };
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        const moduleFactory = new Function(
            'module',
            'exports',
            '__webpack_public_path__',
            'define',
            source
        );
        moduleFactory(
            _module,
            _module.exports,
            publicPath,
            (factory: any) =>
                (_module.exports = typeof factory === 'function' ? factory() : factory)
        );
        return _module.exports;
    }
    public getChunksModulesNames() {
        const compilation = this.stats!.compilation;
        const chunkByName: Record<string, string[]> = {};
        compilation.chunks.forEach((chunk) => {
            const names = [];
            const modules = compilation.chunkGraph.getChunkModulesIterableBySourceType(
                chunk,
                'javascript'
            );
            if (modules) {
                for (const module of modules) {
                    names.push(module.identifier().split(/[\\/]/).slice(-2).join('/'));
                }
            }
            chunkByName[chunk.name] = names;
        });
        return chunkByName;
    }
    public async closeAllPages() {
        if (this.browserContext) {
            await this.browserContext.close();
            this.browserContext = undefined;
            this.log(`Browser Context closed`);
        }
    }
    public async destroy() {
        this.log(`Start Destroy Process`);

        await this.closeAllPages();

        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.log(`Browser closed`);
        }
        if (this.server) {
            this.server.close();
            this.server = null;
            this.log(`Server closed`);
        }
        if (this.watchingHandle) {
            await new Promise<void>((res) => this.watchingHandle?.close(() => res()));
            this.watchingHandle = null;
            this.log(`Watch closed`);
        }
        if (this.compiler) {
            await new Promise((res) => {
                this.compiler!.close(res);
                this.compiler = null;
            });
            this.log(`Compiler closed`);
        }
        await rimraf(this.outputDir);
        if (this.tempPath) {
            await rimraf(this.tempPath);
        }
        this.log(`Finished Destroy`);
    }
    protected loadWebpackConfig(): webpack.Configuration {
        const config = require(join(this.testDir, this.options.configName || 'webpack.config'));
        const loadedConfig = config.default || config;
        return {
            ...loadedConfig,
            ...this.options.webpackOptions,
            output: {
                ...loadedConfig?.output,
                ...this.options.webpackOptions?.output,
                path: this.outputDir,
            },
        };
    }
    private prepareTestDirectory() {
        this.log('Prepare Test Directory');
        const { useTempDir, tempDirPath, projectDir } = this.options;

        if (tempDirPath && existsSync(tempDirPath)) {
            rimrafCallback.sync(tempDirPath);
        }

        if (useTempDir) {
            const tempPath = realpathSync(tempDirPath || createTempDirectorySync('s-t-r').path);
            const tempProjectPath = join(tempPath, 'project');
            nodeFs.copyDirectorySync(projectDir, tempProjectPath);
            symlinkSync(
                join(__dirname, '../../../node_modules'), // #1
                join(tempPath, 'node_modules'),
                'junction'
            );
            this.tempPath = tempPath;
            this.testDir = tempProjectPath;
        } else {
            this.testDir = realpathSync(projectDir);
        }

        this.outputDir = this.options.webpackOptions?.output?.path ?? join(this.testDir, 'dist');
    }
}
