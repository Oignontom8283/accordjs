// framework/buildBot.ts
import { build as vitBuild } from 'vite';
import fs from 'fs';
import path from 'path';
import 'coloriz';
import { getAllFilesRecursive, getConfigPath, sanitizeImportPath } from './utils';
import { SOURCE_CODE_FILE_NAME_REGEX, SOURCE_CODE_FOLDER_NAME_REGEX } from './constant';

export async function build(projectRoot: string, sourceRoot: string = "src", outDir: string = "dist") {
  await vitBuild({
    root: projectRoot, // racine du projet utilisateur
    plugins: [accordJsVitPlugin(path.join(projectRoot, sourceRoot))],
    build: {
      rollupOptions: {
        input: 'virtual:index', // on part de notre fichier virtuel
      },
      outDir: path.resolve(projectRoot, outDir), // sortie
    },
  });
}

function accordJsVitPlugin(sourceRoot: string) {
  return {
    name: 'accordjs_builder',
    resolveId(id: string) {
      if (id === 'virtual:events' || id === 'virtual:index') return id;
    },
    load(id: string) {
      if (id === 'virtual:events') {

        // Get all source code files recursively from the source root
        const filesPaths = getAllFilesRecursive(
          sourceRoot, // The root directory to start searching
          SOURCE_CODE_FILE_NAME_REGEX, // Filter for source code files
          SOURCE_CODE_FOLDER_NAME_REGEX // Filter for source code folders
        ).map(p => sanitizeImportPath(p));

        // Generate import statements and the array of modules
        const imports = filesPaths.map((path, index) => 
          `import e${index} from "${path}";`
        )
        
        // Return the generated code
        return `
${imports.join("\n")}

const a = [${filesPaths.map((path, index) => `{module:e${index}, path:"${path}"}`).join(",")}];

export default a;
        `.trim();
      }

      if (id === 'virtual:index') {

        // Ensure there's a configuration file
        const configPath = getConfigPath(sourceRoot);
        if (!configPath) {
          console.error("No configuration file found in the source code directory.".red);
          process.exit(1);
        }

        // Return the main index file content
        return `
import events from "virtual:events";
import config from "${sanitizeImportPath(configPath)}";
import { start } from "accordjs";

start(config, events, undefined, false);
        `.trim();
      }
    },
  };
}