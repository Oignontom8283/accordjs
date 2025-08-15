import { getAllFilesRecursive } from ".";

function writeLine() {
    console.log("_".repeat(process.stdout.columns));
}

console.log(getAllFilesRecursive(
    "./", // The root directory to start searching
    /\.ts$/, // Filter for TypeScript files
    /^(?!.*node_modules).*$/ // Filter out node_modules folder
));

writeLine();