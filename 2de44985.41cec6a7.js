(window.webpackJsonp=window.webpackJsonp||[]).push([[12],{126:function(e,t,n){"use strict";n.d(t,"a",(function(){return b})),n.d(t,"b",(function(){return u}));var a=n(0),s=n.n(a);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function r(e,t){if(null==e)return{};var n,a,s=function(e,t){if(null==e)return{};var n,a,s={},o=Object.keys(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||(s[n]=e[n]);return s}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(s[n]=e[n])}return s}var p=s.a.createContext({}),c=function(e){var t=s.a.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},b=function(e){var t=c(e.components);return s.a.createElement(p.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return s.a.createElement(s.a.Fragment,{},t)}},m=s.a.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,i=e.parentName,p=r(e,["components","mdxType","originalType","parentName"]),b=c(n),m=a,u=b["".concat(i,".").concat(m)]||b[m]||d[m]||o;return n?s.a.createElement(u,l(l({ref:t},p),{},{components:n})):s.a.createElement(u,l({ref:t},p))}));function u(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,i=new Array(o);i[0]=m;var l={};for(var r in t)hasOwnProperty.call(t,r)&&(l[r]=t[r]);l.originalType=e,l.mdxType="string"==typeof e?e:a,i[1]=l;for(var p=2;p<o;p++)i[p]=n[p];return s.a.createElement.apply(null,i)}return s.a.createElement.apply(null,n)}m.displayName="MDXCreateElement"},82:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return i})),n.d(t,"metadata",(function(){return l})),n.d(t,"toc",(function(){return r})),n.d(t,"default",(function(){return c}));var a=n(3),s=n(7),o=(n(0),n(126)),i={id:"migration-v3",title:"Migrating to Stylable v3"},l={unversionedId:"guides/migration-v3",id:"guides/migration-v3",isDocsHomePage:!1,title:"Migrating to Stylable v3",description:"This guide is intended to help migrate Stylable version 1 to Stylable version 2 or 3.",source:"@site/docs/guides/migration-v3.md",slug:"/guides/migration-v3",permalink:"/stylable.io/docs/guides/migration-v3",editUrl:"https://github.com/wixplosives/stylable.io/edit/master/docs/docs/guides/migration-v3.md",version:"current",sidebar:"someSidebar",previous:{title:"Supporting Server Side Rendering",permalink:"/stylable.io/docs/guides/ssr"},next:{title:"Specification Overview",permalink:"/stylable.io/docs/references/cheatsheet"}},r=[{value:"Update dependencies",id:"update-dependencies",children:[]},{value:"Update <code>.st.css</code> file imports",id:"update-stcss-file-imports",children:[{value:"CSS custom properties",id:"css-custom-properties",children:[]}]},{value:"Update usage in React components",id:"update-usage-in-react-components",children:[]},{value:"Update tests",id:"update-tests",children:[]}],p={toc:r};function c(e){var t=e.components,n=Object(s.a)(e,["components"]);return Object(o.b)("wrapper",Object(a.a)({},p,n,{components:t,mdxType:"MDXLayout"}),Object(o.b)("p",null,"This guide is intended to help migrate Stylable version 1 to Stylable version 2 or 3.\nIt is mainly geared towards Stylable integration in React projects."),Object(o.b)("h1",{id:"suggested-steps-of-migration"},"Suggested steps of migration"),Object(o.b)("p",null,"Follow these steps for a smooth transition. Each step is explained in\nmore detail below."),Object(o.b)("ol",null,Object(o.b)("li",{parentName:"ol"},"Update dependencies"),Object(o.b)("li",{parentName:"ol"},"Update global typings"),Object(o.b)("li",{parentName:"ol"},"Update ",Object(o.b)("inlineCode",{parentName:"li"},".st.css")," file imports"),Object(o.b)("li",{parentName:"ol"},"Update usage in React components"),Object(o.b)("li",{parentName:"ol"},"Update tests")),Object(o.b)("h2",{id:"update-dependencies"},"Update dependencies"),Object(o.b)("p",null,"Ensure you have v3 Stylable dependencies available. You may need to\nupdate your ",Object(o.b)("inlineCode",{parentName:"p"},"package.json")," or ensure that other dependencies bring you\nv3 Stylable:"),Object(o.b)("ul",null,Object(o.b)("li",{parentName:"ul"},Object(o.b)("inlineCode",{parentName:"li"},"@stylable/cli")),Object(o.b)("li",{parentName:"ul"},Object(o.b)("inlineCode",{parentName:"li"},"@stylable/core")),Object(o.b)("li",{parentName:"ul"},Object(o.b)("inlineCode",{parentName:"li"},"@stylable/runtime")),Object(o.b)("li",{parentName:"ul"},Object(o.b)("inlineCode",{parentName:"li"},"@stylable/node")),Object(o.b)("li",{parentName:"ul"},Object(o.b)("inlineCode",{parentName:"li"},"@stylable/webpack-plugin"))),Object(o.b)("blockquote",null,Object(o.b)("p",{parentName:"blockquote"},"Note: all Stylable packages in v3 are scoped under ",Object(o.b)("inlineCode",{parentName:"p"},"@stylable")," namespace.\nif you have dependency like ",Object(o.b)("inlineCode",{parentName:"p"},"stylable")," (without namespace),\nit is a different one and should be changed to scoped version.")),Object(o.b)("h1",{id:"update-global-typings"},"Update global typings"),Object(o.b)("p",null,"If TypeScript is used in the project, we recommend updating the global typings\n(usually ",Object(o.b)("inlineCode",{parentName:"p"},"globals.d.ts"),") with an ",Object(o.b)("inlineCode",{parentName:"p"},".st.css")," module declaration:"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-ts"},"declare module '*.st.css' {\n  const stylesheet: import('@stylable/runtime').RuntimeStylesheet;\n  export = stylesheet;\n}\n")),Object(o.b)("p",null,"This way the TypeScript compiler will help refactor most of the\nrequired changes and provide typings for other Stylable use cases."),Object(o.b)("h2",{id:"update-stcss-file-imports"},"Update ",Object(o.b)("inlineCode",{parentName:"h2"},".st.css")," file imports"),Object(o.b)("p",null,"Prior to v2 all ",Object(o.b)("inlineCode",{parentName:"p"},".st.css")," files would export a default ",Object(o.b)("inlineCode",{parentName:"p"},"style")," function. In v2\nthis has changed: ",Object(o.b)("inlineCode",{parentName:"p"},".st.css")," files now export a named object."),Object(o.b)("p",null,"List of all exported keys:"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},"import {\n  st, // alias to `style`\n  classes,\n  cssStates,\n  keyframes,\n  namespace,\n  stVars,\n  style,\n  vars,\n} from './style.st.css';\n")),Object(o.b)("p",null,"This means that all imports of ",Object(o.b)("inlineCode",{parentName:"p"},".st.css")," files have to be changed, for example:"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-diff"},"-import style from './Component.st.css';\n+import { st, classes, /* ... */ } from './Component.st.css';\n")),Object(o.b)("p",null,"However, most often ",Object(o.b)("inlineCode",{parentName:"p"},"{ st, classes }")," is enough:"),Object(o.b)("p",null,Object(o.b)("inlineCode",{parentName:"p"},"import { st, classes } from './Component.st.css';")),Object(o.b)("blockquote",null,Object(o.b)("p",{parentName:"blockquote"},"Note: ",Object(o.b)("inlineCode",{parentName:"p"},".st.css")," files export a ",Object(o.b)("inlineCode",{parentName:"p"},"style")," function and an alias to it -\n",Object(o.b)("inlineCode",{parentName:"p"},"st"),". It is recommended to use ",Object(o.b)("inlineCode",{parentName:"p"},"st")," in order to avoid name clashing\nwith other variables (for example, some other inline style).")),Object(o.b)("h3",{id:"css-custom-properties"},"CSS custom properties"),Object(o.b)("p",null,"Stylable now localizes CSS Custom Properties. This means that any usage of Custom Proprties (e.g. ",Object(o.b)("inlineCode",{parentName:"p"},"--prop"),") should now be incorparated in the component code."),Object(o.b)("p",null,"See the docs about ",Object(o.b)("a",{parentName:"p",href:"https://stylable.io/docs/references/css-vars"},"CSS custom properties")," for usage examples."),Object(o.b)("h2",{id:"update-usage-in-react-components"},"Update usage in React components"),Object(o.b)("p",null,"Once ",Object(o.b)("inlineCode",{parentName:"p"},".st.css")," imports are updated, React components should be updated too:"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-diff"},"-<div {...style('root', states, props)} /> />\n+<div className={st(classes.root, states, props.className)} />\n")),Object(o.b)("p",null,"There are subtle but very important nuances in this change."),Object(o.b)("ol",null,Object(o.b)("li",{parentName:"ol"},Object(o.b)("p",{parentName:"li"},"Stylable v1 used spread pattern. It would take the output of ",Object(o.b)("inlineCode",{parentName:"p"},"style('root', states, this.props)")," function and spread it on component."),Object(o.b)("p",{parentName:"li"},"This way one or more props would be applied to the component. Thus, code that looks like this:"),Object(o.b)("pre",{parentName:"li"},Object(o.b)("code",{parentName:"pre",className:"language-jsx"},"<div {...style('root', {}, { className: 'additional-class', 'data-hook': 'test' })} />\n")),Object(o.b)("p",{parentName:"li"},"  once evaluated, would behave like this:"),Object(o.b)("pre",{parentName:"li"},Object(o.b)("code",{parentName:"pre",className:"language-jsx"},'<div\n  className="root additional-class"\n  data-hook="test"\n/>\n')),Object(o.b)("p",{parentName:"li"},"  Stylable v2 and v3 usage is like so:"),Object(o.b)("pre",{parentName:"li"},Object(o.b)("code",{parentName:"pre"},"className={st(classes.root, states, this.props.className)}\n")),Object(o.b)("p",{parentName:"li"},"  There is no props spreading anymore and Stylable requires only\n",Object(o.b)("inlineCode",{parentName:"p"},"className")," to be used."),Object(o.b)("p",{parentName:"li"},"  However, if you were relying on the props spread pattern, in v2 and v3 you\nmight find some props missing."),Object(o.b)("p",{parentName:"li"},"  Therefore, with Stylable v3 it is up to you to apply any additional props:"),Object(o.b)("pre",{parentName:"li"},Object(o.b)("code",{parentName:"pre",className:"language-jsx"},'<div className={st(classes.root, states, \'additional-class\')} \n     data-hook="test" \n     hello="world" />\n'))),Object(o.b)("li",{parentName:"ol"},Object(o.b)("p",{parentName:"li"},"Stylable v1 ",Object(o.b)("inlineCode",{parentName:"p"},"style()")," would accept unscoped css class name as a string",Object(o.b)("br",{parentName:"p"}),"\n","This is no longer acceptable in Stylable v2 or v3, for example:"),Object(o.b)("pre",{parentName:"li"},Object(o.b)("code",{parentName:"pre",className:"language-diff"},"-<div {...style('root', state, { className: 'additional-class-name' })} />\n+<div className={style(classes.root, 'additional-class-name')} />\n")),Object(o.b)("p",{parentName:"li"},"note that ",Object(o.b)("inlineCode",{parentName:"p"},"classes.root")," comes from ",Object(o.b)("inlineCode",{parentName:"p"},".st.css"),", which is the correct\nway to import class names."),Object(o.b)("p",{parentName:"li"},"Similar scoping is applied to css variables too, imported from ",Object(o.b)("inlineCode",{parentName:"p"},"vars")))),Object(o.b)("p",null,"Note: find more details and examples in our ",Object(o.b)("a",{parentName:"p",href:"./runtime"},"Runtime")," and ",Object(o.b)("a",{parentName:"p",href:"../getting-started/react-integration"},"React integration")," guides."),Object(o.b)("h2",{id:"update-tests"},"Update tests"),Object(o.b)("p",null,"If you were using ",Object(o.b)("inlineCode",{parentName:"p"},"@stylable/dom-test-kit")," in Stylable v1, it's usage is\nslightly different in v2 and v3:"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-diff"},"import { StylableDOMUtil } from '@Stylable/dom-test-kit';\n-import style from './Component.st.css';\n+import * as styleSheet from './Component.st.css';\n\n-const StylableDOMUtil = new StylableDOMUtil(style);\n+const StylableDOMUtil = new StylableDOMUtil(styleSheet);\n")),Object(o.b)("p",null,"Stylable v2 and v3 ",Object(o.b)("inlineCode",{parentName:"p"},"StylableDOMUtil")," expects to receive an argument which is the whole stylesheet exported from a ",Object(o.b)("inlineCode",{parentName:"p"},".st.css")," file"),Object(o.b)("p",null,"Prior to v2 it was only one thing - the ",Object(o.b)("inlineCode",{parentName:"p"},"style")," function."))}c.isMDXComponent=!0}}]);