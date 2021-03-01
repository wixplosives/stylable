(window.webpackJsonp=window.webpackJsonp||[]).push([[4],{126:function(e,t,r){"use strict";r.d(t,"a",(function(){return b})),r.d(t,"b",(function(){return m}));var n=r(0),o=r.n(n);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function c(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?c(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):c(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function s(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var i=o.a.createContext({}),p=function(e){var t=o.a.useContext(i),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},b=function(e){var t=p(e.components);return o.a.createElement(i.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return o.a.createElement(o.a.Fragment,{},t)}},d=o.a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,a=e.originalType,c=e.parentName,i=s(e,["components","mdxType","originalType","parentName"]),b=p(r),d=n,m=b["".concat(c,".").concat(d)]||b[d]||u[d]||a;return r?o.a.createElement(m,l(l({ref:t},i),{},{components:r})):o.a.createElement(m,l({ref:t},i))}));function m(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var a=r.length,c=new Array(a);c[0]=d;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l.mdxType="string"==typeof e?e:n,c[1]=l;for(var i=2;i<a;i++)c[i]=r[i];return o.a.createElement.apply(null,c)}return o.a.createElement.apply(null,r)}d.displayName="MDXCreateElement"},71:function(e,t,r){"use strict";r.r(t),r.d(t,"frontMatter",(function(){return c})),r.d(t,"metadata",(function(){return l})),r.d(t,"toc",(function(){return s})),r.d(t,"default",(function(){return p}));var n=r(3),o=r(7),a=(r(0),r(126)),c={id:"global-selectors",title:"Global Selectors"},l={unversionedId:"references/global-selectors",id:"references/global-selectors",isDocsHomePage:!1,title:"Global Selectors",description:"In Stylable, selectors are scoped to the stylesheet. But what if you want to target global or other selectors that are not scoped? You can use the :global() directive selector.",source:"@site/docs/references/global-selectors.md",slug:"/references/global-selectors",permalink:"/stylable.io/docs/references/global-selectors",editUrl:"https://github.com/wixplosives/stylable.io/edit/master/docs/docs/references/global-selectors.md",version:"current",sidebar:"someSidebar",previous:{title:"Pseudo-Elements",permalink:"/stylable.io/docs/references/pseudo-elements"},next:{title:"Custom Selectors",permalink:"/stylable.io/docs/references/custom-selectors"}},s=[],i={toc:s};function p(e){var t=e.components,r=Object(o.a)(e,["components"]);return Object(a.b)("wrapper",Object(n.a)({},i,r,{components:t,mdxType:"MDXLayout"}),Object(a.b)("p",null,"In ",Object(a.b)("strong",{parentName:"p"},"Stylable"),", selectors are scoped to the stylesheet. But what if you want to target global or other selectors that are not scoped? You can use the ",Object(a.b)("inlineCode",{parentName:"p"},":global()")," directive selector. "),Object(a.b)("p",null,"In this example ",Object(a.b)("inlineCode",{parentName:"p"},".classB")," and ",Object(a.b)("inlineCode",{parentName:"p"},".classC")," are not scoped to ",Object(a.b)("inlineCode",{parentName:"p"},"Comp")," but are part of the selector query."),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-css"},'@namespace "Comp";\n.classA :global(.classB > .classC) .classD:hover {\n    color: red;\n}\n')),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-css"},"/* CSS output */\n.Comp__classA .classB > .classC .Comp__classD:hover {\n    color: red;\n}\n")),Object(a.b)("blockquote",null,Object(a.b)("p",{parentName:"blockquote"},Object(a.b)("strong",{parentName:"p"},"Note"),Object(a.b)("br",{parentName:"p"}),"\n","You can also use global to keep pseudo-classes native. You can describe them using the syntax below where ",Object(a.b)("inlineCode",{parentName:"p"},"classA")," is scoped and ",Object(a.b)("inlineCode",{parentName:"p"},":selected")," is native."),Object(a.b)("pre",{parentName:"blockquote"},Object(a.b)("code",{parentName:"pre",className:"language-css"},".classA:global(:selected) {\n    color: red;\n}\n"))))}p.isMDXComponent=!0}}]);