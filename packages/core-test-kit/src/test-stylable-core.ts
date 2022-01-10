import { testInlineExpects } from './inline-expectation';
import { Stylable, StylableExports, StylableMeta } from '@stylable/core';
import { createMemoryFs } from '@file-services/memory';
import type { IDirectoryContents } from '@file-services/types';
import { isAbsolute } from 'path';

export interface TestOptions {
    entries: string[];
}
export function testStylableCore(
    input: string | IDirectoryContents,
    options: Partial<TestOptions> = {}
) {
    // infra
    const fs = createMemoryFs(typeof input === `string` ? { '/entry.st.css': input } : input);
    const stylable = Stylable.create({
        fileSystem: fs,
        projectRoot: '/',
        resolveNamespace: (ns) => ns,
    });

    // collect sheets
    const allSheets = fs.findFilesSync(`/`, { filterFile: ({ path }) => path.endsWith(`.st.css`) });
    const entries = options.entries || allSheets;

    // transform entries
    const sheets: Record<string, { meta: StylableMeta; exports: StylableExports }> = {};
    for (const path of entries) {
        if (!isAbsolute(path || '')) {
            throw new Error(testStylableCore.errors.absoluteEntry(path));
        }
        const meta = stylable.process(path);
        const { exports } = stylable.transform(meta);
        sheets[path] = { meta, exports };
    }

    // inline test
    for (const path of allSheets) {
        const meta = stylable.process(path);
        if (!meta.outputAst) {
            // ToDo: test
            stylable.transform(meta);
        }
        testInlineExpects({ meta });
    }

    // expose infra and entry sheets
    return { sheets, stylable, fs };
}
testStylableCore.errors = {
    absoluteEntry: (entry: string) => `entry must be absolute path got: ${entry}`,
};
