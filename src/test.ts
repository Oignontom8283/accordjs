import 'coloriz';
import { getAllFilesRecursive, sanitizeImportPath } from "./utils";

function writeLine() {
    console.log("─".repeat(process.stdout.columns).yellow);
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

console.log(`
    import paths from "./paths";
    console.log(paths);
`)