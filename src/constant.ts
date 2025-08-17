import path from "path";
import dotenv from "dotenv";

dotenv.config({
    "path": process.env.ENV_CONFIG_PATH || path.join(__dirname, "../.env"),
});


/**
 * Is AccordJS in development mode ?
 */
export const ACCORDJS_DEVELOPMENT_MODE = process.env.ACCORDJS_DEV?.trim().toLowerCase() === 'true';


/**
 * Regular expression to match source code folder names.
 * This regex excludes folders with parentheses in their names.
 */
export const SOURCE_CODE_FOLDER_NAME_REGEX = /^(?!.*[()]).*$/;

/**
 * Regular expression to match source code file names.
 * This regex excludes files with parentheses in their names.
 */
export const SOURCE_CODE_FILE_NAME_REGEX = /^(?!.*[()]).*\.(ts|js)$/;

/**
 * List of development guild IDs.
 * This is used to restrict certain features to specific guilds during development.
 */
export const DEV_GUILDS = process.env.ACCORDJS_DEV_GUILDS?.split(",").map(id => id.trim()).filter(id => id.length > 0) || undefined;


// Configuration file names
export const CONFIG_TS_FILE_NAME = process.env.ACCORDJS_CONFIG_TS_FILE_NAME || "config.ts";
export const CONFIG_JS_FILE_NAME = process.env.ACCORDJS_CONFIG_JS_FILE_NAME || "config.js";
export const CONFIG_MJS_FILE_NAME = process.env.ACCORDJS_CONFIG_MJS_FILE_NAME || "config.mjs";