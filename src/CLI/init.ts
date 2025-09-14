import path from "path";
import fs from "fs";
import readline from "readline";
const me:{version:string, description:string, peerDependencies:{"discord.js":string, "ts-loader":string}} = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf-8'));
import 'coloriz';
import { stderr } from "process";
import { ACCORDJS_DEVELOPMENT_MODE } from "../constant";
import envDefault from "../default/env.default";
import tsconfigDefault from "../default/tsconfig.default";
import packageJsonDefault from "../default/packageJson.default";

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

    console.log("📦 Initializing project...");

    let input = args[1]?.trim();

    // ^(?:(?:@(?:[a-z0-9-*~][a-z0-9-*._~]*)?/[a-z0-9-._~])|[a-z0-9-~])[a-z0-9-._~]*$
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

    // Save command execution location
    const cliBasePath = process.cwd();

    // Change the current working directory to the workspace path
    process.chdir(workspacePath);
    const dirName = path.basename(workspacePath);


    console.log(`📂 Workspace path is ${process.cwd()}`);

    // Initializing NPM project
    console.log("📦 Initializing NPM project...");
    
    // Define the package.json content

    const packageJsonPath = path.join(workspacePath, 'package.json')
    if (!fs.existsSync(packageJsonPath)) {
        fs.writeFileSync(packageJsonPath, packageJsonDefault(dirName, {
            "accordjs": ACCORDJS_DEVELOPMENT_MODE ? "file:" + path.join(__dirname, '../../') : me.version,
            'discord.js': me.peerDependencies['discord.js'],
            "ts-loader": me.peerDependencies['ts-loader'],
        }), 'utf-8');
    } else {
        console.log(`ℹ️ package.json file already exists, skipping creation.`.bgYellow.black);
    }

    console.log("📦 Successfully created NPM project");

    
    // Create tsconfig.json file

    const tsconfigPath = path.join(workspacePath, "tsconfig.json");
    if (!fs.existsSync(tsconfigPath)) {
        fs.writeFileSync(tsconfigPath, tsconfigDefault(), 'utf-8');
    } else {
        console.log(`ℹ️ tsconfig.json file already exists, skipping creation.`.bgYellow.black);
    }

    console.log(`📦 Successfully created TypeScript project`);


    // # Add default AccordJS files/folder
    console.log("📂 Creating default AccordJS files and folders...");

    // Create src directory if it doesn't exista
    const srcDir = path.join(workspacePath, 'src');
    if (!fs.existsSync(srcDir)) {
        fs.mkdirSync(srcDir, { recursive: true });
    }

    // Create default env file
    const defaultEnvFile = path.join(workspacePath, '.env');
    if (!fs.existsSync(defaultEnvFile)) {
        fs.writeFileSync(defaultEnvFile, envDefault, 'utf-8');
    } else {
        console.log(`ℹ️ .env file already exists, skipping creation.`.bgYellow.black);
    }

    // no defaukt code file, sorry ):


    console.log("📦 Successfully created default AccordJS files and folders");
    

    // Success message and instuctions
    console.log(`\n🎉 Your AccordJS project is ready !`.bld.greenBright);

    const relativePath = path.relative(cliBasePath, process.cwd());
    const greenNumber = (number:number) => ` ${number} `.bgGreenBright.white.bld;

    console.log(``)
    console.log(`👉 Next steps :`.white);
    console.log(`  ${greenNumber(1)}  cd "${relativePath}"`.gray);
    console.log(`  ${greenNumber(2)}  npm install`.gray);
    console.log(`  ${greenNumber(3)}  npm run dev`.gray);
    console.log('')
    console.log(`✨ Happy coding with AccordJS ! 🚀`.hex("#ff65c3").bld)
    console.log(" “Copy and paste was invented by developers for developers.” - 0xC0000135".italic.hex('#5e5f66'))
    console.log()
    console.log('─'.repeat(stderr.columns || 80).white);
}

