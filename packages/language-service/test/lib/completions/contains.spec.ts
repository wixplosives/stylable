import { expect } from 'chai';
import { createDiagnostics } from '../../test-kit/diagnostics-setup.js';
import { deindent } from '@stylable/core-test-kit';

describe('CSS contains', () => {
    it('should ignore native css lsp diagnostics unknown container at-rule and declarations', () => {
        // remove once css lsp supports is added or we implement the complete lsp ourselves
        const filePath = '/style.st.css';

        const diagnostics = createDiagnostics(
            {
                [filePath]: deindent(`
                    @container a (inline-size > 100px) {}
                    .root {
                        container-name: a;
                        container: a / normal;
                    }
                `),
            },
            filePath,
        );

        expect(diagnostics).to.eql([]);
    });
});
