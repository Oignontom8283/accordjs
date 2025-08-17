import fs from "fs";
import path from "path";
import { CONFIG_JS_FILE_NAME, CONFIG_MJS_FILE_NAME, CONFIG_TS_FILE_NAME } from "./constant";
import { loadModuleFromFile } from ".";
import { Config } from "./types";

/**
 * Returns the absolute path to the first existing configuration file in the given working directory.
 *
 * The function checks for the existence of configuration files in the following order:
 * 1. TypeScript config file (`CONFIG_TS_FILE_NAME`)
 * 2. JavaScript config file (`CONFIG_JS_FILE_NAME`)
 * 3. ECMAScript module config file (`CONFIG_MJS_FILE_NAME`)
 *
 * @param workDir - The working directory to search for configuration files.
 * @returns The absolute path to the first found config file, or `null` if none exist.
 */
export function getConfigPath(workDir: string): string | null {

    // Get the absolute paths to the config files
    const ts = path.join(workDir, CONFIG_TS_FILE_NAME);
    const js = path.join(workDir, CONFIG_JS_FILE_NAME);
    const mjs = path.join(workDir, CONFIG_MJS_FILE_NAME);

    return (
        fs.existsSync(ts) ? ts // if TypeScript config exists
        : fs.existsSync(js) ? js // if JavaScript config exists
        : fs.existsSync(mjs) ? mjs // if MJS config exists
        : null
    );
}

/**
 * Loads and validates an AccordJS configuration from the specified file path.
 *
 * @param filePath - The path to the configuration file.
 * @returns The validated AccordJS configuration object.
 * @throws Will throw an error if the module cannot be loaded or is not a valid AccordJS config.
 */
export function getConfig(filePath: string): Config {

    // Load the module from the specified file path
    const module = loadModuleFromFile(filePath);

    // Ensure the module is a valid AccordJS config
    const config = ensureConfig(module);

    return config;
}

/**
 * Ensures that the provided module conforms to the required AccordJS configuration structure.
 * 
 * This function checks if the input is an object and contains the required properties:
 * - `client`
 * - `token`
 * - `clientId`
 * 
 * If any of these properties are missing or the input is not a valid object, an error is thrown.
 * 
 * @param module - The module to validate as an AccordJS config.
 * @returns The validated module cast as a `Config`.
 * @throws {Error} If the module is not an object or is missing required properties.
 */
export function ensureConfig(module: any): Config {
    if (!module || typeof module !== 'object') {
        throw new Error(`Module is not a valid AccordJS config.`);
    }

    // NOTE: 'client', 'token' and 'clientId' are required properties

    if (!('client' in module)) {
        throw new Error(`Not have a 'client' property.`);
    }

    if (!('token' in module)) {
        throw new Error(`Not have a 'token' property.`);
    }

    if (!('clientId' in module)) {
        throw new Error(`Not have a 'clientId' property.`);
    }

    return module as Config;
}