import path from "path";
import fs from "fs";
import { configDotenv } from "dotenv";
import { ensureFramworkModule, getAllFilesRecursive, loadModuleFromFile, start } from "..";
import { SOURCE_CODE_FILE_NAME_REGEX, SOURCE_CODE_FOLDER_NAME_REGEX } from "../constant";
import { getConfig, getConfigPath } from "../utils";
import { RawModuleEntry } from "../types";

export default async function dev() {
    // I'm not sure exactly what this is for anymore, but as far as I remember, without it, it doesn't work.
    configDotenv({
        "path": path.join(process.cwd(), ".env")
    });

    // Define the working directory
    const workDir = path.join(process.cwd(), "src");


    // Get the configuration file path
    const configPath = getConfigPath(workDir);
    if (!configPath) { // If no config file is found
        console.error("No configuration file found in the source code directory.");
        return;
    }

    try {
        // Load the configuration
        var config = getConfig(configPath);
    } catch (error) {
        console.error(`Error loading configuration from ${configPath}:`, error);
        return;
    }


    // Get all source code files
    const filesPaths = getAllFilesRecursive(
        workDir,
        SOURCE_CODE_FILE_NAME_REGEX, // Match source code files
        SOURCE_CODE_FOLDER_NAME_REGEX // Match source code folders
    );
    // INFO: SOURCE_CODE_FILE_NAME_REGEX and SOURCE_CODE_FOLDER_NAME_REGEX are constant variable (a kind of global parameters)

    // Load the modules
    const rawModules:RawModuleEntry[] = await Promise.all(filesPaths.map(async filePath => ({ module: await loadModuleFromFile(filePath), path: filePath })));


    start(
        config, // Pass the configuration
        rawModules, // Pass the raw modules
        true // Enable development mode (watcher, hot-reloading, etc.)
    );
}