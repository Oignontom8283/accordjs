import path from "path";
import fs from 'fs';
import { webpack } from "webpack";
import indexDefault from "../default/index.default";
import { compile } from "../compiler";

export default async function build() {
    console.log("🚀 Building project...");

    
    const srcDir = path.join(process.cwd(), "src");
    if (!fs.existsSync(srcDir)) {
        console.error("❌ Source directory does not exist. Please create a 'src' directory with an 'index.ts' file.");
        return;
    }

    const entry = path.join(process.cwd(), "src", "index.ts");
    if (fs.existsSync(entry)) {
        console.error("❌ Entry file already exists. Please remove 'src/index.ts' before building.");
        //return;
    }

    // Create entry file (index.ts)
    fs.writeFileSync(entry, indexDefault.trim(), 'utf8');


    const outputFolder = path.join(process.cwd(), "dist");
    const outputFileName = 'bundle.js';

    // if (fs.existsSync(outputFolder)) {
    //     fs.rmSync(outputFolder, { recursive: true, force: true });
    // }
    // fs.mkdirSync(outputFolder, { recursive: true });


    try {
        await compile(entry, outputFolder, outputFileName);
    } catch (err) {
        console.error("❌ Compilation failed:", err);
        return;
    }

    // delete entry file after compilation
    //fs.unlinkSync(entry);


    console.log("✅ Build completed successfully.");
}