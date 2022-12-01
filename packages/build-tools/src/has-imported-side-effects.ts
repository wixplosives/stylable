import type { Imported, Stylable, StylableMeta } from '@stylable/core';
import { STSymbol, CSSCustomProperty } from '@stylable/core/dist/index-internal';

export function hasImportedSideEffects(stylable: Stylable, meta: StylableMeta, imported: Imported) {
    // direct import usage
    const { keyframes, layer } = imported.typed;
    if (keyframes && Object.keys(keyframes).length) {
        return true;
    }
    if (layer && Object.keys(layer).length) {
        return true;
    }

    const m = stylable.resolver.getModule(imported);
    if (m.kind === 'css' && m.value) {
        const runtimeDefs = CSSCustomProperty.getRuntimeTypedDefinitionNames(m.value);
        for (const propSymbol of Object.values(STSymbol.getAllByType(meta, 'cssVar'))) {
            if (
                propSymbol.alias?.import === imported &&
                runtimeDefs.includes(propSymbol.alias.name)
            ) {
                return true;
            }
        }
    }

    //compose usage // ToDo: run once ouside
    for (const localSymbol of Object.values(meta.getAllClasses())) {
        if (
            localSymbol['-st-extends'] &&
            localSymbol['-st-extends']._kind === 'import' &&
            localSymbol['-st-extends'].import.request === imported.request
        ) {
            const cssResolved = stylable.resolver.resolveSymbolOrigin(
                localSymbol['-st-extends'],
                meta
            );
            if (
                cssResolved?.symbol &&
                cssResolved.symbol._kind === 'class' &&
                cssResolved.meta.root !== cssResolved.symbol.name
            ) {
                return true;
            }
        }
    }

    return false;
}
