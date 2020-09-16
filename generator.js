const {npath, ppath, xfs} = require(`@yarnpkg/fslib`);
const cp = require(`child_process`);
const faker = require(`faker`);
const webpack = require('webpack');

const INITIAL_SEED = 123;

const NUMBER_OF_MODULES = 500;
const NUMBER_OF_ENTRIES = 2;

async function run(id) {
    faker.seed(INITIAL_SEED + id - 1);

    const modules = [];
    for (let id = 0; id < NUMBER_OF_MODULES; ++id)
        modules.push({fileName: `file${`${id}`.padStart(4, `0`)}.js`, staticImports: new Set(), dynamicImports: new Set()});

    const entries = new Set();
    for (let t = 0; t < NUMBER_OF_ENTRIES; ++t)
        entries.add(faker.random.number(modules.length - 1));

    const randomDep = () => {
        let dep;
        do {
            dep = faker.random.number(modules.length - 1);
        } while (entries.has(dep));
        return dep;
    };

    for (const module of modules) {
        module.size = faker.random.number(30000);
        module.lazyOnly = faker.random.number(100) === 0;

        for (let t = 0; t < faker.random.number(8); ++t) {
            if (!module.lazyOnly) {
                module.staticImports.add(randomDep());
            } else {
                module.staticImports.add(randomDep());
            }
        }

        for (let t = 0; t < faker.random.number(8); ++t) {
            module.dynamicImports.add(randomDep());
        }
    }

    const target = ppath.join(npath.toPortablePath(__dirname), `app${`${id}`.padStart(4, `0`)}`);

    await xfs.removePromise(target);
    await xfs.mkdirPromise(target);

    await Promise.all(modules.map(async (module, moduleIndex) => {
        let content = ``;

        for (const importTarget of module.staticImports)
            content += `import fn${importTarget} from './${modules[importTarget].fileName}';\n`;
        content += `\n`;
        content += `let hasRan = false;\n`;
        content += `\n`;
        content += `const fn = async function () {\n`;
        content += `  if (hasRan) return;\n`;
        content += `  hasRan = true;\n`;
        for (const importTarget of module.staticImports)
            content += `  await fn${importTarget}();\n`;
        for (const importTarget of module.dynamicImports)
            content += `  await (await import('./${modules[importTarget].fileName}')).default();\n`;
        content += `  "${'x'.repeat(module.size)}";\n`;
        content += `};\n`;
        content += `\n`;
        content += `export default fn;\n`;
        if (entries.has(moduleIndex))
            content += `fn().catch(err => { console.error(err.stack); process.exitCode = 1; });\n`;

        await xfs.writeFilePromise(ppath.join(target, module.fileName), content);
    }));

    const config = {
        context: npath.fromPortablePath(target),
        entry: {},
        mode: `none`,
        target: `node`,
        optimization: {
            moduleIds: `hashed`,
        },
        output: {
            path: npath.fromPortablePath(ppath.join(target, `out`)),
            filename: `[name].js`,
            chunkFilename: `[name].[contenthash].js`,
        },
    };

    for (const moduleIndex of entries) {
        const module = modules[moduleIndex];
        config.entry[module.fileName.replace(`.js`, `.bundle`)] = `./${module.fileName}`;
    }

    await new Promise((resolve, reject) => {
        webpack(config, (err, stats) => {
            if (err || stats.hasErrors()) {
                reject(err || new Error(`Webpack error: ${stats.toString()}`));
            } else {
                resolve();
            }
        });
    });

    for (const entry of Object.keys(config.entry)) {
        try {
            cp.execFileSync(process.execPath, [npath.join(config.output.path, `${entry}.js`)]);
        } catch {
            return false;
        }
    }

    return true;
}

async function main() {
    for (let t = 1; t <= 1000; ++t) {
        try {
            console.log(`Testing ${t}`);
            if (!await run(t)) {
                return;
            }
        } catch (err) {
            console.log(`Failed: ${err.message}`);
            return;
        }
    }
}

main();
