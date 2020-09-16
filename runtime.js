const path = require(`path`);

global.window = {};

global.document = {
    head: {
        appendChild: script => {
            const root = path.dirname(process.argv[1]);

            process.nextTick(() => {
                console.error(script.src);
                require(path.join(root, script.src));
            });
        },
    },
    createElement: type => {
        return {
            setAttribute: () => {},
        };
    },
};
