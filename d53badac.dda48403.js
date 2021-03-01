(window.webpackJsonp=window.webpackJsonp||[]).push([[42],{112:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return o})),n.d(t,"metadata",(function(){return i})),n.d(t,"toc",(function(){return s})),n.d(t,"default",(function(){return p}));var a=n(3),r=n(7),l=(n(0),n(126)),o={id:"install-configure",title:"Installation"},i={unversionedId:"getting-started/install-configure",id:"getting-started/install-configure",isDocsHomePage:!1,title:"Installation",description:"There are currently two options for installing and working with Stylable as described in the following sections.",source:"@site/docs/getting-started/install-configure.md",slug:"/getting-started/install-configure",permalink:"/stylable.io/docs/getting-started/install-configure",editUrl:"https://github.com/wixplosives/stylable.io/edit/master/docs/docs/getting-started/install-configure.md",version:"current",sidebar:"someSidebar",previous:{title:"Getting Started",permalink:"/stylable.io/docs/"},next:{title:"React Integration",permalink:"/stylable.io/docs/getting-started/react-integration"}},s=[{value:"Create a new Stylable project from a boilerplate",id:"create-a-new-stylable-project-from-a-boilerplate",children:[]},{value:"Install Stylable to work with an existing project",id:"install-stylable-to-work-with-an-existing-project",children:[]},{value:"Write in Stylable",id:"write-in-stylable",children:[]},{value:"Build configuration",id:"build-configuration",children:[]},{value:"Types",id:"types",children:[]}],c={toc:s};function p(e){var t=e.components,n=Object(r.a)(e,["components"]);return Object(l.b)("wrapper",Object(a.a)({},c,n,{components:t,mdxType:"MDXLayout"}),Object(l.b)("p",null,"There are currently two options for installing and working with ",Object(l.b)("strong",{parentName:"p"},"Stylable")," as described in the following sections."),Object(l.b)("h2",{id:"create-a-new-stylable-project-from-a-boilerplate"},"Create a new Stylable project from a boilerplate"),Object(l.b)("p",null,"To begin writing your own project, you can create a ",Object(l.b)("strong",{parentName:"p"},"Stylable")," app from our boilerplate. The project can be created by any of the following commands:"),Object(l.b)("p",null,"Using ",Object(l.b)("inlineCode",{parentName:"p"},"npx"),":"),Object(l.b)("pre",null,Object(l.b)("code",{parentName:"pre",className:"language-bash"},"npx create-stylable-app <project-name>\n")),Object(l.b)("p",null,"Using ",Object(l.b)("inlineCode",{parentName:"p"},"npm"),":"),Object(l.b)("pre",null,Object(l.b)("code",{parentName:"pre",className:"language-bash"},"npm init stylable-app <project-name>\n")),Object(l.b)("p",null,"Using ",Object(l.b)("inlineCode",{parentName:"p"},"yarn"),":"),Object(l.b)("pre",null,Object(l.b)("code",{parentName:"pre",className:"language-bash"},"yarn create stylable-app <project-name>\n")),Object(l.b)("p",null,"For the ",Object(l.b)("inlineCode",{parentName:"p"},"<project-name>")," placeholder above, replace with the name of your project. Once you run the command, a directory with that same name is created. Go to that directory and run ",Object(l.b)("inlineCode",{parentName:"p"},"npm start")," to view the project in a browser, or ",Object(l.b)("inlineCode",{parentName:"p"},"npm run build")," to build your project's target code."),Object(l.b)("p",null,"The project includes several basic components and ",Object(l.b)("strong",{parentName:"p"},"Stylable")," stylesheets which have the suffix ",Object(l.b)("inlineCode",{parentName:"p"},".st.css"),". "),Object(l.b)("h2",{id:"install-stylable-to-work-with-an-existing-project"},"Install Stylable to work with an existing project"),Object(l.b)("p",null,"To work with an existing ",Object(l.b)("inlineCode",{parentName:"p"},"webpack")," based project, you can install ",Object(l.b)("a",{parentName:"p",href:"https://github.com/wix/stylable"},"Stylable")," and the ",Object(l.b)("a",{parentName:"p",href:"https://github.com/wix/stylable/tree/master/packages/webpack-plugin"},"@stylable/webpack-plugin")," packages from our GitHub repositories. "),Object(l.b)("p",null,"Install ",Object(l.b)("strong",{parentName:"p"},"Stylable")," and the ",Object(l.b)("strong",{parentName:"p"},"@stylable/webpack-plugin")," as a dependency in your local project."),Object(l.b)("p",null,"Using npm:"),Object(l.b)("pre",null,Object(l.b)("code",{parentName:"pre",className:"language-bash"},"npm install stylable @stylable/webpack-plugin --save-dev\n")),Object(l.b)("p",null,"Using Yarn:"),Object(l.b)("pre",null,Object(l.b)("code",{parentName:"pre",className:"language-bash"},"yarn add stylable @stylable/webpack-plugin --dev\n")),Object(l.b)("h2",{id:"write-in-stylable"},"Write in Stylable"),Object(l.b)("p",null,"Once you've installed either the boilerplate or the packages into your own project, you can begin writing in ",Object(l.b)("strong",{parentName:"p"},"Stylable"),". Look through the ",Object(l.b)("a",{parentName:"p",href:"/stylable.io/docs/references/cheatsheet"},"Specifications Reference")," for specs and code examples. "),Object(l.b)("p",null,"To take advantage of code completion and diagnostics, install ",Object(l.b)("a",{parentName:"p",href:"/stylable.io/docs/getting-started/stylable-intelligence"},Object(l.b)("strong",{parentName:"a"},"Stylable Intelligence"))," currently supported for only Visual Studio Code."),Object(l.b)("h2",{id:"build-configuration"},"Build configuration"),Object(l.b)("p",null,"Currently we support Webpack as our build system. To author a component library, use our CLI tool to build each CSS separately."),Object(l.b)("p",null,"Add ",Object(l.b)("strong",{parentName:"p"},"Stylable")," to your Webpack configuration as follows: "),Object(l.b)("pre",null,Object(l.b)("code",{parentName:"pre",className:"language-js"},"const { StylableWebpackPlugin } = require('@stylable/webpack-plugin');\n...\n{\n    module: {\n        rules: [\n        {\n            test: /\\.(png|jpg|gif)$/,\n            use: [\n            {\n                loader: \"url-loader\",\n                options: {\n                    limit: 8192\n                }\n            }\n            ]\n        }\n        ]\n    }\n    plugins: [\n        new StylableWebpackPlugin()\n    ]\n}\n")),Object(l.b)("p",null,"For more information on configuring the @stylable/webpack-plugin, see the ",Object(l.b)("a",{parentName:"p",href:"https://github.com/wix/stylable/tree/master/packages/webpack-plugin"},"readme file"),"."),Object(l.b)("h2",{id:"types"},"Types"),Object(l.b)("p",null,"TypeScript requires to be made aware of Stylable in order to provide typings and module resolution for ",Object(l.b)("inlineCode",{parentName:"p"},"*.st.css")," files. To do this, create a ",Object(l.b)("inlineCode",{parentName:"p"},"globals.d.ts")," file in your ",Object(l.b)("inlineCode",{parentName:"p"},"./src")," directory and add the following declaration."),Object(l.b)("pre",null,Object(l.b)("code",{parentName:"pre",className:"language-js"},"// globals.d.ts\ndeclare module '*.st.css' {\n    const stylesheet: import('@stylable/runtime').RuntimeStylesheet;\n    export = stylesheet;\n}\n")),Object(l.b)("p",null,"If your project TypeScript version is below ",Object(l.b)("inlineCode",{parentName:"p"},"2.9")," and does not support ",Object(l.b)("a",{parentName:"p",href:"https://blogs.msdn.microsoft.com/typescript/2018/05/31/announcing-typescript-2-9/#import-types"},"import type"),", copy the following snippet into your ",Object(l.b)("inlineCode",{parentName:"p"},"globals.d.ts")," file."),Object(l.b)("pre",null,Object(l.b)("code",{parentName:"pre",className:"language-js"},"export type StateValue = boolean | number | string;\n\nexport interface StateMap {\n    [stateName: string]: StateValue;\n}\n\nexport interface AttributeMap {\n    className?: string;\n    [attributeName: string]: StateValue | undefined;\n}\n\nexport interface InheritedAttributes {\n    className?: string;\n    [props: string]: any;\n}\n\nexport interface StylableExports {\n    classes: Record<string, string>;\n    keyframes: Record<string, string>;\n    vars: Record<string, string>;\n    stVars: Record<string, string>;\n}\n\nexport interface RuntimeStylesheet extends StylableExports, RenderableStylesheet {\n    namespace: string;\n    cssStates: (stateMap: StateMap) => string;\n    style: (context: string, stateOrClass: string | StateMap, ...classes: string[]) => string;\n}\n\nexport interface RenderableStylesheet {\n    $depth: number;\n    $id: string | number;\n    $css?: string;\n}\n\ndeclare module '*.st.css' {\n    const stylesheet: import('@stylable/runtime').RuntimeStylesheet;\n    export = stylesheet;\n}\n")))}p.isMDXComponent=!0},126:function(e,t,n){"use strict";n.d(t,"a",(function(){return b})),n.d(t,"b",(function(){return g}));var a=n(0),r=n.n(a);function l(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){l(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},l=Object.keys(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var c=r.a.createContext({}),p=function(e){var t=r.a.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},b=function(e){var t=p(e.components);return r.a.createElement(c.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.a.createElement(r.a.Fragment,{},t)}},d=r.a.forwardRef((function(e,t){var n=e.components,a=e.mdxType,l=e.originalType,o=e.parentName,c=s(e,["components","mdxType","originalType","parentName"]),b=p(n),d=a,g=b["".concat(o,".").concat(d)]||b[d]||u[d]||l;return n?r.a.createElement(g,i(i({ref:t},c),{},{components:n})):r.a.createElement(g,i({ref:t},c))}));function g(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var l=n.length,o=new Array(l);o[0]=d;var i={};for(var s in t)hasOwnProperty.call(t,s)&&(i[s]=t[s]);i.originalType=e,i.mdxType="string"==typeof e?e:a,o[1]=i;for(var c=2;c<l;c++)o[c]=n[c];return r.a.createElement.apply(null,o)}return r.a.createElement.apply(null,n)}d.displayName="MDXCreateElement"}}]);