import type { IFileSystem, IWatchEvent, WatchEventListener } from '@file-services/types';
import type { StylableResolverCache } from '@stylable/core';
import { Log, levels } from '../logger';
import { createWatchEvent, DirectoryProcessService } from './directory-process-service';

interface RegisterMetaData {
    identifier: string;
}

interface Service {
    identifier: string;
    directoryProcess: DirectoryProcessService;
}

interface DirectoriesHandlerServiceOptions {
    log?: Log;
    resolverCache?: StylableResolverCache;
    outputFiles?: Map<string, string>;
    rootDir?: string;
}

export class DirectoriesHandlerService {
    private services = new Set<Service>();
    private listener: WatchEventListener | undefined;
    private resolverCache: StylableResolverCache = new Map();
    constructor(
        private fileSystem: IFileSystem,
        private options: DirectoriesHandlerServiceOptions = {}
    ) {
        if (this.options.resolverCache) {
            this.resolverCache = this.options.resolverCache;
        }
    }

    public register(directoryProcess: DirectoryProcessService, { identifier }: RegisterMetaData) {
        this.services.add({
            identifier,
            directoryProcess,
        });
    }

    public start() {
        this.listener = async (event) => {
            this.invalidateCache(event.path);

            let foundChanges = false;
            const files = new Map<string, IWatchEvent>();
            const filesChangesSummary = {
                changed: 0,
                deleted: 0,
            };

            for (const { directoryProcess, identifier } of this.services) {
                for (const path of directoryProcess.getAffectedFiles(event.path)) {
                    files.set(path, createWatchEvent(path, this.fileSystem));
                }

                const { hasChanges } = await directoryProcess.handleWatchChange(files, event);

                if (hasChanges) {
                    this.options.log?.(`Processing files of "${identifier}"`);
                }

                foundChanges = foundChanges || hasChanges;
            }

            if (foundChanges) {
                this.log(levels.clear);
                this.log(
                    `Change detected at "${event.path.replace(this.options.rootDir ?? '', '')}".`
                );

                for (const file of files.values()) {
                    if (file.stats) {
                        filesChangesSummary.changed++;
                    } else {
                        filesChangesSummary.deleted++;
                    }
                }

                this.log(
                    'Found',
                    filesChangesSummary.changed,
                    'changes and',
                    filesChangesSummary.deleted,
                    'deletions.'
                );
                this.log('Watching files...');
            }
        };

        this.fileSystem.watchService.addGlobalListener(this.listener);
    }

    public stop() {
        if (this.listener) {
            this.fileSystem.watchService.removeGlobalListener(this.listener);
        } else {
            throw new Error('Directories Handler never started');
        }
    }

    private invalidateCache(path: string) {
        for (const [key, meta] of this.resolverCache) {
            if (!meta) {
                continue;
            }

            if (
                typeof meta.source === 'string' &&
                (meta.source === path || this.options.outputFiles?.get(meta.source) === path)
            ) {
                this.resolverCache.delete(key);
            }
        }
    }

    private log(...messages: any[]) {
        if (messages[0] === levels.clear) {
            this.options.log?.(levels.clear);
        } else {
            this.options.log?.(`[${new Date().toLocaleTimeString()}]`, ...messages, levels.info);
        }
    }
}
