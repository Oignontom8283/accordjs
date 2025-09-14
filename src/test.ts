import { getAllFilesRecursive, sanitizeImportPath } from "./utils";

function writeLine() {
    console.log("_".repeat(process.stdout.columns));
}

const paths = getAllFilesRecursive(
    "./", // The root directory to start searching
    /\.ts$/, // Filter for TypeScript files
    /^(?!.*node_modules).*$/ // Filter out node_modules folder
)

console.log(paths);

writeLine();

console.log(paths.map(p => sanitizeImportPath(p)));

writeLine();