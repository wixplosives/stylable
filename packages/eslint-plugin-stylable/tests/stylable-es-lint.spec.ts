import { ESLintUtils } from '@typescript-eslint/experimental-utils';
import StylableLint from '../src/stylable-es-lint';
import { nodeFs } from '@file-services/node';
import { createTempDirectorySync } from 'create-temp-directory';

// mock afterAll for RuleTester (should be fixed in next version)
(globalThis as any).afterAll = (globalThis as any).after;

const tester = new ESLintUtils.RuleTester({
    parser: '@typescript-eslint/parser',
    parserOptions: {
        sourceType: 'module',
    },
});

const tmp = createTempDirectorySync('stylable-eslint');
const filename = nodeFs.join(tmp.path, 'index.ts');

nodeFs.writeFileSync(
    nodeFs.join(tmp.path, 'index.st.css'),
    `
:vars {
  key: "value"; 
}
.root {
  --cssVar: green;
  color: red;
}

@keyframes test {}
`
);

after(() => {
    tmp.remove();
});

tester.run('basic unknown locals discovery', StylableLint, {
    invalid: [
        {
            filename,
            code: "import {classes as XYZ} from './index.st.css'; const a = XYZ.part",
            errors: [{ messageId: 'unknown-local' }],
        },
        {
            filename,
            code: "import {classes as XYZ} from './index.st.css'; const a = XYZ['part']",
            errors: [{ messageId: 'unknown-local' }],
        },
        {
            filename,
            code: "import {classes as XYZ} from './index.st.css'; ()=> {const a = XYZ.zzz}",
            errors: [{ messageId: 'unknown-local' }],
        },
        {
            filename,
            code: "import {keyframes as XYZ} from './index.st.css'; const a = XYZ.zzz",
            errors: [{ messageId: 'unknown-local' }],
        },
        {
            filename,
            code: "import {vars as XYZ} from './index.st.css'; const a = XYZ.zzz",
            errors: [{ messageId: 'unknown-local' }],
        },
        {
            filename,
            code: "import {stVars as XYZ} from './index.st.css'; const a = XYZ.zzz",
            errors: [{ messageId: 'unknown-local' }],
        },
    ],
    valid: [
        {
            filename,
            code: "import {classes as XYZ} from './index.st.css'; const a = XYZ.root",
        },
        {
            filename,
            code: "import {classes as XYZ} from './index.st.css'; (XYZ)=> {const a = XYZ.zzz}",
        },
        {
            filename,
            code: "import {classes as XYZ} from './index.st.css'; const a = XYZ['root']",
        },
        {
            filename,
            code: "import {keyframes as XYZ} from './index.st.css'; const a = XYZ.test",
        },
        {
            filename,
            code: "import {vars as XYZ} from './index.st.css'; const a = XYZ.cssVar",
        },
        {
            filename,
            code: "import {stVars as XYZ} from './index.st.css'; const a = XYZ.key",
        },
    ],
});
