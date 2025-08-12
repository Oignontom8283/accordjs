import path from "path";
import { initializeFRomFileSystem } from "..";
import { configDotenv } from "dotenv";

export default async function dev() {
    configDotenv({
        "path": path.join(process.cwd(), ".env")
    })
    initializeFRomFileSystem(path.join(process.cwd(), "src"))
}