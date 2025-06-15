#!/usr/bin/env node

import init from "./init";

const args = process.argv.slice(2);
const command = args[0];

(async () => {
    if (command === "init") {
        await init(args);
    }
})();