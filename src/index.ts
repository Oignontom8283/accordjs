import fs from 'fs';
import path from 'path';
import { Client } from "discord.js";
import { AnyCreateReturn, AnyEvent, NormalizedModule, ValidatedModule, Config, RawModuleEntry } from "./types";

export function deployEvent(client: Client, event: AnyEvent): { eventName: string, listener: (...args: any[]) => void } {

    // Create the listener function
    const listener = (...args: any[]) => {

        if (event.handler) { // If a handler is defined
            const out = event.handler(args[0]);
            if (out !== null) {
                event.execute(out);
            }
        } else {
            event.execute(args[0]);
        }
    };

    if (event.once) {
        client.once(event.name, listener);
    } else {
        client.on(event.name, listener);
    }

    // Return the reference to the listener
    return { eventName: event.name, listener };
}

/**
 * Recursively retrieves all file paths from a directory, applying optional filters for files and folders.
 *
 * @param dir - The root directory to start searching from.
 * @param fileFiltre - Optional regular expression to filter file **names**. Defaults to matching all files.
 * @param folderFiltre - Optional regular expression to filter folder **names**. Defaults to matching all folders.
 * @returns An array of file paths that match the specified filters.
 */
export function getAllFilesRecursive(dir: string, fileFiltre: RegExp = /^.*$/, folderFiltre: RegExp = /^.*$/): string[] {
    const results: string[] = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (folderFiltre.test(path.basename(fullPath))) {
                results.push(...getAllFilesRecursive(fullPath, fileFiltre, folderFiltre));
            }
        } else if (fileFiltre.test(path.basename(fullPath))) {
            results.push(fullPath);
        }
    }

    return results;
}

/**
 * Dynamically loads a module from the specified file path.
 *
 * This function supports both CommonJS (`require`) and ECMAScript Modules (`import`).
 * It detects the module system at runtime and loads the module accordingly.
 * 
 * I use this method to dynamically import any file from any type of Node.js project, whether it uses CommonJS or ESM.
 * This approach ensures compatibility and flexibility, allowing the code to load modules regardless of the project's module system or file structure.
 *
 * @param filePath - The path to the module file to load.
 * @returns A promise that resolves to the loaded module.
 */
export async function loadModuleFromFile(filePath: string) {
    if (typeof require !== "undefined") {
        // CommonJS
        return require(filePath);
    } else {
        // ESM
        return (await import(filePath)).default || await import(filePath);
    }
}

export function ensureFramworkModule(module: any): AnyCreateReturn {

    if (!module || typeof module !== 'object') {
        throw new Error(`Module is not a valid AccordJS module.`);
    }

    if (!('type' in module) || !['event', 'command'].includes(module.type)) {
        throw new Error(`Module does not have a valid 'type' property.`);
    }

    if (!('arg' in module)) {
        throw new Error(`Module does not have an 'arg' property.`);
    }

    return module as AnyCreateReturn;
}

export function start(config:Config, rawModuleEntry:RawModuleEntry[], devMod:boolean = false, devGuilds: string[] = []) {

    // Create an array to hold the processed modules
    const normalizedModule:NormalizedModule[] = [];
    for (const item of rawModuleEntry) {
        if (Array.isArray(item.module)) {
            item.module.forEach((mod, index) => {
                normalizedModule.push({ module: mod, path: item.path, index });
            })
        } else {
            normalizedModule.push({ module: item.module, path: item.path, index: 0 });
        }
    }

    // Validate args and set types
    const validatedModule:ValidatedModule[] = [];
    for (const item of normalizedModule) {
        try {
            const mod = ensureFramworkModule(item.module);
            validatedModule.push({ module: mod, path: item.path, index: item.index });
        } catch (error) {
            // If the module is invalid, log the error and not push it to the array
            console.error(`Error processing module in ${item.path} at [${item.index}]:`, error);
        }
    }


    // Type guards for module types
    const isEvent = (item: ValidatedModule): item is ValidatedModule & { module: { type: "event" } } => item.module.type === "event";
    const isCommand = (item: ValidatedModule): item is ValidatedModule & { module: { type: "command" } } => item.module.type === "command";

    // Separate the modules into their respective types
    const events = validatedModule.filter(isEvent).map(item => ({event: item.module.arg, path: item.path}));
    const command = validatedModule.filter(isCommand).map(item => ({command: item.module.arg, path: item.path}));

    // Deploy the events
    const eventsListeners: (ReturnType<typeof deployEvent> & { path: string })[] = []
    for (const event of events) {
        // Deploy the event and store the result
        const result = deployEvent(config.client, event.event)

        // Store the result along with the event path
        eventsListeners.push({...result, path: event.path});
    }


}