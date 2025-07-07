#!/usr/bin/env node

import { initializeAccordJS } from "..";
import { ACCORDJS_DEVLOPMENT_MODE } from "../constant";
import init from "./init";
import start from './start';

ACCORDJS_DEVLOPMENT_MODE && console.log("⚠️ Development mode is enabled. This is not recommended for production use.".yellow.italic);

const args = process.argv.slice(2);
const command = args[0];

(async () => {
    if (command === "init") {
        await init(args);
    }
    else if (command === "start") {
        start()
    }
    else {
        console.log(`\n❌ Unknown command: ${command}. Please use \`accordjs help\` for a list of available commands.\n`.red);
        process.exit(1);
    }
})();