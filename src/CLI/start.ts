import path from "path";
import fs from "fs";
import { initializeAccordJS } from "..";
import { CONFIG_FILE_NAME_JS, CONFIG_FILE_NAME_TS } from "../constant";
import { AccordJSConfigFile } from "../types";
import Logger from "../logger";

export default async function start() {

    const tsConfigPath = path.join(process.cwd(), CONFIG_FILE_NAME_TS);
    const jsConfigPath = path.join(process.cwd(), CONFIG_FILE_NAME_JS);

    const framworkConfig = fs.existsSync(tsConfigPath) ? tsConfigPath : fs.existsSync(jsConfigPath) ? jsConfigPath : null; // Get the path to the configuration file, if it exists
    if (!framworkConfig) {
        console.error(`❌ AccordJS configuration file not found. Please create a ${CONFIG_FILE_NAME_TS} or ${CONFIG_FILE_NAME_JS} file in the root of your project.\n`.red);
        process.exit(1);
    }
    
    // Import the configuration file
    let config = await import(framworkConfig);
    if (config.default) { // If the configuration file exports a default export, use it
        config = config.default;
    }
    
    // TODO: Check the properties of the configuration
    if (typeof config !== "object" || !config) {
        console.error(`❌ Invalid AccordJS configuration file. Please ensure it exports a valid configuration object.\n`.red);
        process.exit(1);
    }
    
    config = config as AccordJSConfigFile; // Cast the configuration to the AccordJSConfigFile type

    console.debug("TOKEN =", config.TOKEN);

    initializeAccordJS({
        "TOKEN": config.TOKEN,
        "CLIENT_ID": config.CLIENT_ID,
        "SOURCE_PATH": path.join(process.cwd(), 'src'),
        "DEVLOPEMENT_MODE": true
    })
}