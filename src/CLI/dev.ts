import path from "path";
import { configDotenv } from "dotenv";
import { getAllFilesRecursive, loadModuleFromFile } from "..";
import { SOURCE_CODE_FILE_NAME_REGEX, SOURCE_CODE_FOLDER_NAME_REGEX } from "../constant";
import { AnyCreateReturn } from "../types";

export default async function dev() {
    configDotenv({
        "path": path.join(process.cwd(), ".env")
    })

    const workDir = path.join(process.cwd(), "src");

    const filesPaths = getAllFilesRecursive(
        workDir,
        SOURCE_CODE_FILE_NAME_REGEX, // Match source code files
        SOURCE_CODE_FOLDER_NAME_REGEX // Match source code folders
    )

    const rawModules:{module:any, path:string}[] = filesPaths.map(filePath => ({ module: loadModuleFromFile(filePath), path: filePath }));

    // const modules: {export: AnyCreateReturn, id: string} = 