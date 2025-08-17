import fs from 'fs';
import path from 'path';
import { Client } from "discord.js";
import { A, AnyCommand, AnyCreateReturn, AnyEvent, B, C } from "./types";

export function deployEvent(client: Client, event: AnyEvent) {

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

export function loadModuleFromFile(filePath: string) {
    return require(filePath);
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

export function start(a:A[], devMod:boolean = false) {

    // Create an array to hold the processed modules
    const b:B[] = [];
    for (const item of a) {
        if (Array.isArray(item.module)) {
            item.module.forEach((mod, index) => {
                b.push({ module: mod, path: item.path, index });
            })
        } else {
            b.push({ module: item.module, path: item.path, index: 0 });
        }
    }

    // Validate args and set types
    const c:C[] = [];
    for (const item of b) {
        try {
            const mod = ensureFramworkModule(item.module);
            c.push({ module: mod, path: item.path, index: item.index });
        } catch (error) {
            // If the module is invalid, log the error and not push it to the array
            console.error(`Error processing module in ${item.path} at [${item.index}]:`, error);
        }
    }



    // for (const item of a) {

    // }
    
}