import fs from 'fs';
import path from 'path';
import { Client } from "discord.js";
import { AnyEvent } from "./types";

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