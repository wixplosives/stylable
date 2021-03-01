(window.webpackJsonp=window.webpackJsonp||[]).push([[39],{109:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return c})),n.d(t,"metadata",(function(){return s})),n.d(t,"toc",(function(){return l})),n.d(t,"default",(function(){return i}));var r=n(3),o=n(7),a=(n(0),n(126)),c={id:"root",title:"Root",layout:"docs"},s={unversionedId:"references/root",id:"references/root",isDocsHomePage:!1,title:"Root",description:"Every Stylable stylesheet has a reserved class called root that matches the root node of the component.",source:"@site/docs/references/root.md",slug:"/references/root",permalink:"/stylable.io/docs/references/root",editUrl:"https://github.com/wixplosives/stylable.io/edit/master/docs/docs/references/root.md",version:"current",sidebar:"someSidebar",previous:{title:"Imports",permalink:"/stylable.io/docs/references/imports"},next:{title:"CSS Class Selectors",permalink:"/stylable.io/docs/references/class-selectors"}},l=[{value:"Examples",id:"examples",children:[]}],p={toc:l};function i(e){var t=e.components,n=Object(o.a)(e,["components"]);return Object(a.b)("wrapper",Object(r.a)({},p,n,{components:t,mdxType:"MDXLayout"}),Object(a.b)("p",null,"Every Stylable stylesheet has a reserved class called ",Object(a.b)("inlineCode",{parentName:"p"},"root")," that matches the root node of the component."),Object(a.b)("p",null,"The ",Object(a.b)("inlineCode",{parentName:"p"},"root")," class is used to signify a rendering component top-level where a new  scope of namespacing is created. Each component is responsible for placing the ",Object(a.b)("inlineCode",{parentName:"p"},"root")," class on its top-level node for itself."),Object(a.b)("p",null,"You can apply default styling and behavior to the component on the root class itself."),Object(a.b)("p",null,"If the root class exists and is being used, all other classes defined in the stylesheet are assumed to be nested under the ",Object(a.b)("inlineCode",{parentName:"p"},"root")," class (at any depth)."),Object(a.b)("h2",{id:"examples"},"Examples"),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-css"},'@namespace "Comp";\n.root { background: red; } /* set component background to red */\n')),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-css"},"/* CSS output */\n.Comp__root { background: red; }\n")),Object(a.b)("p",null,"The ",Object(a.b)("inlineCode",{parentName:"p"},"root")," class name can be applied to a component node by using our ",Object(a.b)("a",{parentName:"p",href:"/stylable.io/docs/getting-started/react-integration"},"React integration"),"."),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-js"},"/* comp.jsx */\nimport React from 'react';\nimport { style, classes } from './comp.st.css';\n\nclass Comp extends React.Component {\n    render () {\n        return (\n            <div className={style(classes.root, {}, this.props.className)} />\n        );\n    }\n}\n")),Object(a.b)("blockquote",null,Object(a.b)("p",{parentName:"blockquote"},Object(a.b)("strong",{parentName:"p"},"Note"),Object(a.b)("br",{parentName:"p"}),"\n","Root can also define ",Object(a.b)("a",{parentName:"p",href:"./pseudo-classes"},"states")," and ",Object(a.b)("a",{parentName:"p",href:"/stylable.io/docs/references/extend-stylesheet"},"extend another component"),".")))}i.isMDXComponent=!0},126:function(e,t,n){"use strict";n.d(t,"a",(function(){return b})),n.d(t,"b",(function(){return m}));var r=n(0),o=n.n(r);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function c(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?c(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):c(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var p=o.a.createContext({}),i=function(e){var t=o.a.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},b=function(e){var t=i(e.components);return o.a.createElement(p.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return o.a.createElement(o.a.Fragment,{},t)}},d=o.a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,c=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),b=i(n),d=r,m=b["".concat(c,".").concat(d)]||b[d]||u[d]||a;return n?o.a.createElement(m,s(s({ref:t},p),{},{components:n})):o.a.createElement(m,s({ref:t},p))}));function m(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,c=new Array(a);c[0]=d;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s.mdxType="string"==typeof e?e:r,c[1]=s;for(var p=2;p<a;p++)c[p]=n[p];return o.a.createElement.apply(null,c)}return o.a.createElement.apply(null,n)}d.displayName="MDXCreateElement"}}]);