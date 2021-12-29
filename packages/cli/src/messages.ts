export const buildMessages = {
    START_WATCHING() {
        return 'Start watching...';
    },
    CONTINUE_WATCH() {
        return `Watching files...`;
    },
    FINISHED_PROCESSING(count: number, location?: string) {
        return `Finished processing ${count} ${count === 1 ? 'file' : 'files'}${
            location ? ` in "${location}"` : ''
        }.`;
    },
    BUILD_PROCESS_INFO(location: string) {
        return `Processing files of "${location}"`;
    },
    BUILD_SKIPPED(identifier?: string) {
        return `No stylable files found. build skipped${identifier ? ` for "${identifier}"` : ''}.`;
    },
    CHANGE_DETECTED(location: string) {
        return `Change detected at "${location}".`;
    },
    WATCH_SUMMARY(changes: number, deleted: number) {
        return `Detected ${changes} changes and ${deleted} deletions.`;
    },
    NO_DIANGOSTICS() {
        return `Found 0 diagnostics.`;
    },
};

export const errorMessages = {
    STYLABLE_PROCESS(filePath: string) {
        return `Stylable failed to process "${filePath}"`;
    },
};
