# project-generator

Project made to try to reproduce the bug described in https://github.com/webpack/webpack/issues/8677.

To try it out, clone the repository, run `yarn install`, then run `yarn node generator.js`. It will try to generate a bunch of application with many different dependency graphs (without any external dependency), using both static and dynamic imports. The default parameters have been tuned to crash from the first try, so you should experience the following:

```
Testing 1
Error: Qualified path resolution failed - none of the candidates can be found on the disk.

Source path: /Users/mael.nison/project-generator/app0001/out/1.undefined.js
Rejected candidate: /Users/mael.nison/project-generator/app0001/out/1.undefined.js
Rejected candidate: /Users/mael.nison/project-generator/app0001/out/1.undefined.js.js
Rejected candidate: /Users/mael.nison/project-generator/app0001/out/1.undefined.js.json
Rejected candidate: /Users/mael.nison/project-generator/app0001/out/1.undefined.js.node

Require stack:
- /Users/mael.nison/project-generator/app0001/out/file0348.bundle.js
    at internalTools_makeError (/Users/mael.nison/project-generator/.pnp.js:8713:34)
    at resolveUnqualified (/Users/mael.nison/project-generator/.pnp.js:9745:13)
    at resolveRequest (/Users/mael.nison/project-generator/.pnp.js:9769:14)
    at Object.resolveRequest (/Users/mael.nison/project-generator/.pnp.js:9829:26)
    at Function.external_module_.Module._resolveFilename (/Users/mael.nison/project-generator/.pnp.js:8946:34)
    at Function.external_module_.Module._load (/Users/mael.nison/project-generator/.pnp.js:8811:48)
    at Module.require (internal/modules/cjs/loader.js:1043:19)
    at require (internal/modules/cjs/helpers.js:77:18)
    at Function.requireEnsure [as e] (/Users/mael.nison/project-generator/app0001/out/file0348.bundle.js:45:25)
    at fn (/Users/mael.nison/project-generator/app0001/out/file0348.bundle.js:7229:36)
```
