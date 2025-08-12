import path from "path";
import dotenv from "dotenv";

dotenv.config({
    "path": process.env.ENV_CONFIG_PATH || path.join(__dirname, "../.env"),
});


/**
 * Is AccordJS in development mode ?
 */
export const ACCORDJS_DEVLOPMENT_MODE = process.env.ACCORDJS_DEV?.trim().toLowerCase() === 'true'


export const CONFIG_FILE_NAME_JS = process.env.ACCORDJS_CONFIG_FILE_NAME_JS || "accordjs.config.js";

export const CONFIG_FILE_NAME_TS = process.env.ACCORDJS_CONFIG_FILE_NAME_TS || "accordjs.config.ts";


/**
 * EN: Regex to match source code files.
 */
export const SOURCE_CODE_FILE_REGEX = /^(?!index\.(js|ts)$)(?!.*\.d\.ts$).*\.([jt]s)$/;


export const DEV_GUILDS = process.env.ACCORDJS_DEV_GUILDS?.split(",").map(id => id.trim()).filter(id => id.length > 0) || ["1325883985691410473"];