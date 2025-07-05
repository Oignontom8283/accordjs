import fs from 'fs';
import path from 'path';
import 'coloriz'
import Logger from './logger';


/**
 * Recursively retrieves files from a directory that match a given regex pattern.
 * 
 * @param dir - The directory to search in.
 * @param regex - The regular expression to match file names.
 * @param maxIterations - Maximum recursion depth to prevent infinite loops (default: 1000).
 * @returns An array of matching file paths.
 */
export function getRecursiveFiles(
    dir: string,
    regex: RegExp,
    maxIterations: number = 1000
): string[] {
    // Check if the directory exists
    if (!fs.existsSync(dir)) {
        throw new Error(`The directory ${dir} does not exist.`);
    }

    // Ensure the directory path is absolute
    if (!path.isAbsolute(dir)) {
        dir = path.resolve(__dirname, dir);
    }

    const resultFiles: string[] = [];

    /**
     * Internal helper function for recursion.
     * @param currentDir - The directory to search in.
     * @param depth - Current recursion depth.
     */
    function recurse(currentDir: string, depth: number) {
        if (depth > maxIterations) {
            // Stop recursion if max depth is reached
            Logger.warn(`Maximum recursion depth of ${maxIterations} reached in directory: ${currentDir}`);
            return;
        }

        // Read directory entries
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);

            if (entry.isDirectory()) {
                // Recurse into subdirectory
                recurse(fullPath, depth + 1);
            } else if (regex.test(entry.name)) {
                // Add file if it matches the regex
                resultFiles.push(fullPath);
            }
        }
    }

    // Start recursion from the initial directory
    recurse(dir, 0);

    return resultFiles;
}

