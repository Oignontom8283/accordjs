
import path from "path";
import { ChatInputCommandInteraction, Client, Events, GatewayIntentBits, REST, Routes, TimestampStyles, time } from "discord.js";
import fs from "fs";
import { ACCORDJS_DEVLOPMENT_MODE, DEV_GUILDS, SOURCE_CODE_FILE_REGEX } from "./constant";
import { AnyCreateReturn, CreateArg, CreateReturn } from "./types";

// ======================== Initialize & Load env ========================


const TOKEN = ""
const CLIENT_ID = ""

const ENVIRONMENT = process.env.NODE_ENV || "development";

// Initialize the client
export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});



// ======================== Load Modules and Commands ========================

// display the mode of load modules
console.log(`Load modules mode ${ACCORDJS_DEVLOPMENT_MODE ? "Development (File System)" : "Production (Webpack Context)"}`)




// const loadModulesFileSystem = (dir: string) => {
//     function getAllCodeFiles(currentDir: string): string[] {
//         const entries = fs.readdirSync(currentDir, { withFileTypes: true });
//         return entries.flatMap(entry => {
//             const fullPath = path.join(currentDir, entry.name);
//             if (entry.isDirectory()) return getAllCodeFiles(fullPath);
//             return [fullPath];
//         })
//     }

//     const absoluteDir = path.isAbsolute(dir) ? dir : path.join(__dirname, dir);
//     const files = getAllCodeFiles(absoluteDir);

//     return files.map(file => ({
//         path: file,
//         modules: require(file),
//     }));
// }

// const loadModuleFromWebpackContext = (context:__WebpackModuleApi.RequireContext) => {
//     return context.keys()
//         .map(key => ({ path: key, modules: context(key) }));
// }


// const checkModuleName = (filePath:string):boolean => {
//     const name = path.basename(filePath)

//     const regex = /^\((.+)\)\.(ts|js)$/

//     return !regex.test(name)
// }

// const eventsModulesPath = "./events"
// const commandsModulesPath = "./commands"

// // Load modules from the file system or webpack context
// const [ eventsModule, commandsModule ] = (DEVLOPMENT_MODE ? [
//     loadModulesFileSystem(eventsModulesPath),
//     loadModulesFileSystem(commandsModulesPath)
// ] : [
//     loadModuleFromWebpackContext(require.context(eventsModulesPath, true, /\.(ts|js)$/)),
//     loadModuleFromWebpackContext(require.context(commandsModulesPath, true, /\.(ts|js)$/))
// ])
//     .map(list => list.filter((item) => checkModuleName(item.path) && item.modules !== undefined && item.modules !== null))
//     .map(list => {
//         let modules:{path:string, module:any, position:number}[] = []

//         // Resolve the method to access the module
//         list = list.map(item => 'default' in item.modules ? { ...item, modules: item.modules.default } : item)

//         for (const item of list) {
            
//             if (Array.isArray(item.modules)) {
//                 item.modules.forEach((module, index) => 
//                     modules.push({ path: item.path, module, position: index })
//                 )
//             } else {
//                 modules.push({ path: item.path, module: item.modules, position: 0 })
//             }
//         }

//         return modules;
//     })

// console.debug(`[DEBUG] Loaded events ${eventsModule.length} : ${eventsModule.map(item => `${path.basename(item.path)} [${item.position}]`).join(", ")}`)
// console.debug(`[DEBUG] Loaded commands ${commandsModule.length} : ${commandsModule.map(item => `${path.basename(item.path)} [${item.position}]`).join(", ")}`)

// // Processing events modules
// for (const { path, module, position } of eventsModule) {

//     const check = (module:any):boolean => 'name' in module && 'once' in module && 'execute' in module

//     // Check if the module has the required properties
//     if (check(module) || check(module.default)) {
//         events.push(module);
//     } else {
//         console.warn(`[WARNING] The event at ${path} [${position}] is missing a required "name", "once" or "execute" property. CONTENT : ${JSON.stringify(module)}`);
//     }
// }

// // Processing commands modules
// for (const { path, module, position } of commandsModule) {

//     const check = (module:any) => 'data' in module && 'execute' in module

//     // Check if the module has the required properties
//     if (check(module) || check(module.default)) {
//         commands.push({ data: module.data, execute: module.execute, cooldown: module.cooldown });
//         DeployCommands.push(module.data.toJSON());
//     } else {
//         console.warn(`[WARNING] The command at ${path} [${position}] is missing a required "data" or "execute" property.`);
//     }
// }


// Load modules from the file system or webpack context


/**
 * 
 * @param dir 
 * @param regex 
 * @returns - An array of absolute file paths that match the regex pattern.
 */
function getRecursiveFiles(dir: string, regex: RegExp, maxIterations: number = 1000): string[] {
    if (!fs.existsSync(dir)) {
        throw new Error(`The directory ${dir} does not exist.`);
    }
    path.isAbsolute(dir) || (dir = path.resolve(__dirname, dir));

    const files: string[] = [];
    let currentDir = dir;
    let iterations = 0;
    while (iterations < maxIterations) {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);
            if (entry.isDirectory()) {
                files.push(...getRecursiveFiles(fullPath, regex, maxIterations - iterations));
            } else if (regex.test(entry.name)) {
                files.push(fullPath);
            }
        }
        // Break the loop if no new files were found
        if (files.length === 0) break;
        iterations++;
    }
    if (iterations >= maxIterations) {
        console.warn(`[WARNING] Maximum iterations reached (${maxIterations}). Some files may not have been processed.`);
    }
    return files;
}


type UnValidetedModule = {
    path: string;
    module:CreateReturn<"event"> | CreateReturn<"command">;
    position: number;
}


// function startByFile(dir: string) {
    
//     if (!fs.existsSync(dir)) {
//         throw new Error(`The directory ${dir} does not exist.`);
//     }
//     if (!path.isAbsolute(dir)) {
//         throw new Error(`The directory ${dir} must be an absolute path.`);
//     }

//     const modules:Module[] = [];

//     const files = getRecursiveFiles(dir, /\.(ts|js)$/);
//     files.forEach((file, index) => {
//         const module = require(file);
//         if (module && module.type && module.arg) {
//             modules.push({ path: file, module: module.arg, position: index });
//         } else {
//             console.warn(`[WARNING] The file ${file} does not export a valid AccordJS module.`);
//         }
//     })

// }

type ExportsModule = Partial<AnyCreateReturn>

let required:{  require: ExportsModule | ExportsModule[], path: string}[] = []
if (ENVIRONMENT === "development") {
    const dir = process.cwd();

    const files = getRecursiveFiles(dir, SOURCE_CODE_FILE_REGEX);
    for (const path of files) {

        const module = require(path);
        
        const content = module && (module.default || module);

        if (content) {
            required.push({ require: module, path: path });
        } else {
            console.warn(`[WARNING] The file ${path} does not export a valid AccordJS module.`);
        }
    }
} else {
    // In production mode, we use the webpack context to load modules
    const context = require.context("./", true, SOURCE_CODE_FILE_REGEX);
    context.keys().forEach((key) => {
        const module = context(key);
        const content = module && (module.default || module);

        if (content) {
            required.push({ require: content, path: key });
        } else {
            console.warn(`[WARNING] The file ${key} does not export a valid AccordJS module.`);
        }
    });
}


// 

// const exportedModules: UnValidetedModule[] = required.flatMap((item) => {
//     const exported = item.require;

//     const checkExportKey = (exported: Partial< CreateReturn<"event" | "command">>): boolean => "type" in exported && "arg" in exported;

//     if (Array.isArray(exported)) {
//         return exported
//             .map((module, index) => {
//                 if (checkExportKey(module)) {
//                     return { path: item.path, module, position: index + 1 };
//                 } else {
//                     console.warn(`[WARNING] The module at ${item.path} [${index + 1}] does not export a valid AccordJS module.`);
//                     return undefined;
//                 }
//             })
//             .filter((mod): mod is UnValidetedModule => mod !== undefined);
//     } else {
//         if (checkExportKey(exported)) {
//             return [{ path: item.path, module: exported, position: 1 }];
//         } else {
//             console.warn(`[WARNING] The module at ${item.path} does not export a valid AccordJS module.`);
//             return [];
//         }
//     }
// });

let exportedModules: UnValidetedModule[] = [];
for (const item of required) {
    
    // Check if the item has a require property and if it is an array or a single object
    const checkExportKey = (exported: Partial<AnyCreateReturn>): boolean => "type" in exported && "arg" in exported;


    const exported = Array.isArray(item.require) ? item.require : [item.require];

    exported.forEach((module, index) => {
        if (checkExportKey(module)) {
            exportedModules.push({ path: item.path, module:module as AnyCreateReturn, position: index + 1 });
        } else {
            console.warn(`[WARNING] The module at ${item.path} [${index + 1}] does not export a valid AccordJS module.`);
        }
    });
}

const commands: CreateArg<"command">[] = [];
const DeployCommands: any[] = [];
const events: CreateArg<"event">[] = [];

for (const item of exportedModules) {
    const module = item.module;
    if (module.type === "event") {
        
        // Check if the module has the required properties
        // | name    ->  the name of the event (for discord.js)
        // | once    ->  if the event is a one-time event (for discord.js)
        // | execute ->  the function to execute when the event is triggered
        // | handler ->  the function to execute before the event's execute function (optional)

        if (typeof module.arg.name !== 'string' || typeof module.arg.execute !== 'function' || typeof module.arg.once !== "boolean") {
            console.warn(`[WARNING] The event at ${item.path} [${item.position}] is missing a required "name", "once" or "execute" property. CONTENT : ${JSON.stringify(module.arg)}`);
            continue;
        }

        // Add the event to the events array
        events.push(module.arg)
        
    }
    else if (item.module.type === "command") {
        // Check if the module has the required properties
        // | data    ->  the data of the command (for discord.js)
        // | execute ->  the function to execute when the command is triggered
        // | cooldown ->  the cooldown of the command (optional, can be a number or a function)
        // | handler ->  the function to execute before the command's execute function (optional)

        if (typeof module.arg.data !== 'object' || typeof module.arg.execute !== 'function') {
            console.warn(`[WARNING] The command at ${item.path} [${item.position}] is missing a required "data" or "execute" property. CONTENT : ${JSON.stringify(module.arg)}`);
            continue;
        }

        commands.push(module.arg);
        DeployCommands.push(module.arg.data.toJSON());
    }

}

// ========================= Deploy Commands ========================

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(TOKEN);

// and deploy your commands!
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        
        
        let data:any
        if (ACCORDJS_DEVLOPMENT_MODE) {

            console.log(`The methode of deploy application (/) command is Development mode.`)
            
            if (DEV_GUILDS.length === 0) {
                console.error(`[ERROR] The DEV_GUILDS array is empty. Please define at least one guild ID in the ACCORDJS_DEV_GUILDS env variable.`);
                process.exit(1)
            }

            for (const devGuildId of DEV_GUILDS) {
                
                // Clear all commands of the guild
                await rest.put(
                    Routes.applicationGuildCommands(CLIENT_ID, devGuildId),
                    { body: {} }
                )

                // The put method is used to fully refresh all commands in the guild with the current set
                data = await rest.put(
                    Routes.applicationGuildCommands(CLIENT_ID, devGuildId),
                    { body: DeployCommands },
                )

                console.log(`[DEV] Successfully deploy commands in the guild ${devGuildId} : ${(data as Array<any>).length} application (/) commands.`);
            }
        } else {
            console.log(`The methode of deploy application (/) commade is Global deploy.`)
            
            // Clear all commands
            await rest.put(
                Routes.applicationCommands(CLIENT_ID),
                { body: {} }
            )
    
            // The put method is used to fully refresh all commands in the guild with the current set
            data = await rest.put(
                Routes.applicationCommands(CLIENT_ID),
                { body: DeployCommands },
            );
        }

        console.log(`Successfully reloaded ${(data as Array<any>).length} application (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(`[ERROR] The deployement of commands failed : ${error}`);
    }
})();



// ======================== Manage Reply Command ========================

const cooldowns:Record<string, Record<string, Date>> = {}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.find(objet => objet.data.name === interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {

        ACCORDJS_DEVLOPMENT_MODE && console.debug(`[DEV] Command /${interaction.commandName} executed by ${interaction.user.username} (${interaction.user.id})`)

        if (Number.isInteger(command.cooldown)) {
            const cooldown = command.cooldown as number

            command.cooldown = (lastUse:Date, now:Date, cooldowns:Record<string, Record<string, Date>>, interaction:ChatInputCommandInteraction) => {
                //const delay = (now - lastUse) / 1000
                const delay = (now.getTime() - lastUse.getTime()) / 1000;
                if (delay < cooldown) {
                    interaction.reply({ content: `You will be able to reuse the \`/${interaction.commandName}\` command **${time(new Date(lastUse.getTime() + cooldown*1000), TimestampStyles.RelativeTime)}**`, ephemeral: true,});
                    return false
                } else {
                    return true
                }
            }
        }

        if (typeof command.cooldown === "function") {
            const lastUse = new Date(cooldowns[interaction.user.id]?.[command.data.name] || 0);
            const now = interaction.createdAt;

            if (command.cooldown(lastUse, now, cooldowns, interaction)) {
                // Update the cooldown for the user and command
                if (!cooldowns[interaction.user.id]) {
                    cooldowns[interaction.user.id] =  {};
                }
                cooldowns[interaction.user.id][command.data.name] = now;
                // setTimeout(() => cooldowns.get(interaction.user.id)?.delete(command.data.name), (command.cooldown as number) * 1000);
            } else {
                // If the cooldown logic returns false, do not execute the command
                return;
            }
        }

        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        };
    };
});



// ======================== Emit Events ========================

// Emit Events
for (const event of events) {
    const listener = (...args: any[]) => {
        // Check if the event has a handler and execute it if it does
        // If the handler returns null, do not execute the event's execute function
        if (event.handler) {
            const out = event.handler(args[0]);
            if (out !== null) {
                event.execute(out);
            }
        } else {
            event.execute(args[0]);
        }
    };

    // Register the event listener with the client
    // Use client.once for one-time events and client.on for regular events
    if (event.once) {
        client.once(event.name, listener);
    } else {
        client.on(event.name, listener);
    }
}

// ======================== Login to Discord with your app's token ========================

if (!process.env.TOKEN) {
    console.error("The Discord Token in env variable is not define !")
    process.exit(1)
}
client.login(process.env.TOKEN)