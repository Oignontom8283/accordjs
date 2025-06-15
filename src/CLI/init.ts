import path from "path";
import fs from "fs";
import readline from "readline";
const me = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf-8'));
import 'coloriz';

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
    // Copier les templates, initialiser git, installer les deps, etc.Z

    let workspacePath = process.cwd();

    const arg2 = args[1];
    if (arg2) {
        if (path.isAbsolute(arg2)) {
            workspacePath = arg2;
        } else {
            workspacePath = path.join(workspacePath, arg2);
        }
    } else {
        const regex =  /^[a-zA-Z0-9-_]+$/; // Regex to allow alphanumeric characters, hyphens, and underscores
        
        while (true) {
            const rl = await asl(`${'?'.magentaBright.bld} Workspace name ? ${'("." for current dir)'.gray.italic} : `.rgb(155, 153, 247));
            var trimmedNameInput = rl.trim();
            
            if (trimmedNameInput === '.') {
                console.log("ℹ️ Using current directory as workspace.".yellow);
                break;
            } else if (!regex.test(trimmedNameInput) || trimmedNameInput === '') {
                console.log("❌ Invalid workspace name. Please use only alphanumeric characters, hyphens, and underscores.".red);
                continue;
            } else {
                break;
            }
        }

        workspacePath = path.isAbsolute(trimmedNameInput) ? trimmedNameInput : path.join(workspacePath, trimmedNameInput);
    }

    // set workspace path

    // Check if the workspace dir exists, if not create it
    if (!fs.existsSync(workspacePath)) {
        fs.mkdirSync(workspacePath, { recursive: true });
    }

    process.chdir(workspacePath);
    console.log(`📂 Workspace path is ${process.cwd()}`);

    // Initilisation du projet npm
    
    console.log("📦 Initialisation du projet npm...")
    
    const packageJson = {
        name: path.basename(workspacePath),
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
            "accordjs": me.version
        },
    }

    try {
        fs.writeFileSync(path.join(workspacePath, 'package.json'), JSON.stringify(packageJson, null, 2));
    } catch (error:any) {
        console.error("❌ Error writing package.json:", error.message.red);
        process.exit(1);
    }

    console.log("📦 Successfully create NPM project".greenBright);
}