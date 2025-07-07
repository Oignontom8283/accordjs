import path from "path";
import fs from "fs";
import readline from "readline";
const me = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf-8'));
import 'coloriz';
import { ACCORDJS_DEVLOPMENT_MODE, CONFIG_FILE_NAME_TS } from "../constant";
import { TS_CONFIG_FILE_CONTENT } from "../default/config";

function asl(question:string): Promise<string>{
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

export default async function init(args:string[]) {
    
    console.log(`\n🚀 AccordJS CLI ${('v' + me.version).white} - ${me.description.white}\n`.yellow);

    console.log("📦 Initialisation du projet...");

    // if (arg2) {
    //     if (path.isAbsolute(arg2)) {
    //         workspacePath = arg2;
    //     } else {
    //         workspacePath = path.join(workspacePath, arg2);
    //     }
    // } else {
    //     const regex =  /^[a-zA-Z0-9-_]+$/; // Regex to allow alphanumeric characters, hyphens, and underscores
        
    //     while (true) {
    //         const rl = await asl(`${'?'.magentaBright.bld} Workspace name ? ${'("." for current dir)'.gray.italic} : `.rgb(155, 153, 247));
    //         var trimmedNameInput = rl.trim();
            
    //         if (trimmedNameInput === '.') {
    //             console.log("ℹ️ Using current directory as workspace.".yellow);
    //             break;
    //         } else if (!regex.test(trimmedNameInput) || trimmedNameInput === '') {
    //             console.log("❌ Invalid workspace name. Please use only alphanumeric characters, hyphens, and underscores.".red);
    //             continue;
    //         } else {
    //             break;
    //         }
    //     }

    //     workspacePath = path.isAbsolute(trimmedNameInput) ? trimmedNameInput : path.join(workspacePath, trimmedNameInput);
    // }

    let input = args[1]?.trim();

    const regex = /^[A-Za-z_\-/\\.]+$/; //  Regex to allow alphanumeric characters, hyphens, underscores, slashes, and dots
    while (true) {
        if (input === ".") {
            console.log("ℹ️ Using current directory as workspace.".bgYellow.black);
            break;
        }
        else if (!input || input === "") {
            console.log("❌ You must provide a workspace name !".red);
        }
        else if (!regex.test(input)) {
            console.log("❌ Invalid workspace name. Please use only alphanumeric characters, hyphens, and underscores.".red);
        } else {
            break;
        }

        input = (await asl(`${'?'.magentaBright.bld} Workspace name ? ${'("." for current dir)'.gray.italic} : `.rgb(155, 153, 247))).trim();
    }

    // set workspace path
    const workspacePath = path.isAbsolute(input) ? input : path.join(process.cwd(), input);

    // Check if the workspace dir exists, if not create it
    if (!fs.existsSync(workspacePath)) {
        fs.mkdirSync(workspacePath, { recursive: true });
    }

    // Change the current working directory to the workspace path
    process.chdir(workspacePath);
    const dirName = path.basename(workspacePath);

    console.log(`📂 Workspace path is ${process.cwd()}`);

    // Initializing NPM project
    console.log("📦 Initializing NPM project...".yellow);
    
    // Define the package.json content
    const packageJson = {
        name: dirName,
        version: "1.0.0",
        description: "accordJS discord bot project",
        scripts: {
            start: "accordjs start",
            build: "accordjs build",
            dev: "accordjs dev",
            test: "accordjs dev",
        },
        license: "MIT",
        author: "",
        dependencies: {
            // Set the AccordJS link to the local package if in development mode, otherwise use the version from package.json
            "accordjs": ACCORDJS_DEVLOPMENT_MODE ? "file:" + path.join(__dirname, '../../') : me.version,
        },
    }

    // 
    try {
        fs.writeFileSync(path.join(workspacePath, 'package.json'), JSON.stringify(packageJson, null, 2));
    } catch (error:any) {
        console.error("❌ Error writing package.json:", error.message.red);
        process.exit(1);
    }

    console.log("📦 Successfully create NPM project".greenBright);


    // # Add default AccordJS files/folder
    console.log("📂 Creating default AccordJS files and folders...");

    // Create src directory if it doesn't exista
    const srcDir = path.join(workspacePath, 'src');
    if (!fs.existsSync(srcDir)) {
        fs.mkdirSync(srcDir, { recursive: true });
    }

    // Create default config file
    const configFilePath = path.join(workspacePath, CONFIG_FILE_NAME_TS);
    if (!fs.existsSync(configFilePath)) {
        fs.writeFileSync(configFilePath, TS_CONFIG_FILE_CONTENT);
    } else {
        console.log(`⚠️ Configuration file ${CONFIG_FILE_NAME_TS} already exists. Skipping creation.`.yellow);
    }

    // no defaukt code file, sorry


    console.log("📦 Successfully created default AccordJS files and folders".greenBright);
    
    console.log(`\n🎉 Your AccordJS project is ready!`.greenBright);
}