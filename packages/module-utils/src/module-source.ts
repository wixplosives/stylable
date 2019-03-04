import { StylableResults } from '@stylable/core';

export function generateModuleSource(
    stylableResult: StylableResults,
    moduleId: string,
    imports: string[],
    renderer: string,
    createFunction: string,
    css: string,
    depth: string,
    exportsArgument: string,
    afterExports: string,
    renderableOnly: boolean = false
): string {
    const { exports, meta } = stylableResult;
    const localsExports = JSON.stringify(exports);
    const root = JSON.stringify(meta.root);
    const namespace = JSON.stringify(meta.namespace);
    if (renderableOnly) {
        return `${createFunction}.createRenderable(${css}, ${depth}, ${moduleId});`;
    }
    return `
${imports.join('\n')}
${exportsArgument} = ${createFunction}.create(
    ${root},
    ${namespace},
    ${localsExports},
    ${css},
    ${depth},
    ${moduleId},
    ${renderer}

);
${afterExports}
`;
}
