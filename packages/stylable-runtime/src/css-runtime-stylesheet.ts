import { RuntimeStylesheet, StateMap, AttributeMap } from './types';

function create(
  root: string,
  namespace: string,
  locals: { [localName: string]: string },
  css: string,
  depth: number,
  id: string | number
): RuntimeStylesheet {

  const dataNamespace = "data-" + namespace.toLowerCase() + "-";

  function cssStates(stateMapping: StateMap) {
    return stateMapping
      ? Object.keys(stateMapping).reduce((states, key) => {
        const stateValue = stateMapping[key];

        if (
          stateValue === undefined ||
          stateValue === null ||
          stateValue === false
        ) {
          return states;
        }

        states[dataNamespace + key.toLowerCase()] = stateValue;

        return states;
      }, {} as StateMap)
      : {};
  }

  function get(localName: string): string {
    return locals[localName];
  }

  function mapClasses(className: string): string {
    return className
      .split(/\s+/g)
      .map(className => get(className) || className)
      .join(" ");
  }

  locals.$root = root;
  locals.$namespace = namespace;
  locals.$depth = depth;
  locals.$id = id;
  locals.$css = css;

  locals.$get = get;
  locals.$cssStates = cssStates;

  function stylable_runtime_stylesheet(className: string, states: StateMap, inheritedAttributes: AttributeMap) {
    className = className ? mapClasses(className) : "";

    const base = cssStates(states);

    if (inheritedAttributes) {
      for (const k in inheritedAttributes) {
        if (k.match(/^data-/)) {
          base[k] = inheritedAttributes[k];
        }
      }

      if (inheritedAttributes.className) {
        className += " " + inheritedAttributes.className;
      }
    }

    if (className) {
      base.className = className;
    }

    return base;
  }

  Object.setPrototypeOf(stylable_runtime_stylesheet, locals);

  return stylable_runtime_stylesheet;
}

function createTheme(css, depth, id) {
  return { $css: css, $depth: depth, $id: id, $theme: true };
}

exports.create = create;
exports.createTheme = createTheme;
