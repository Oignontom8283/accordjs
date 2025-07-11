
import path from "path";
import fs from "fs";
import { ChatInputCommandInteraction, Client, Events, GatewayIntentBits, REST, Routes, TimestampStyles, time } from "discord.js";
import { ACCORDJS_DEVLOPMENT_MODE, DEV_GUILDS, SOURCE_CODE_FILE_REGEX } from "./constant";
import { AnyCreateReturn, CreateArg, CreateReturn } from "./types";
import { getRecursiveFiles } from "./utils";

export * from "./types";


type StartOptions<T extends boolean> = T extends true 
    ? { DEVLOPEMENT_MODE: true, SOURCE_PATH: string, TOKEN: string, CLIENT_ID: string } 
    : { DEVLOPEMENT_MODE: false, SOURCE_PATH?: string, TOKEN: string, CLIENT_ID: string};



export function initializeAccordJS<T extends boolean>(args: StartOptions<T>) {
    // Diplay a message if the development mode is enabled
    args.DEVLOPEMENT_MODE && console.log(`[DEV] Development mode is enabled. Loading modules from the file system.`.blueBright)

    //
    // #######################################################
    // ###         Check the variables are correct         ###
    // #######################################################

    // Initialize the discord client
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent
        ]
    });

    // ======================== Load Modules and Commands ========================


    type UnvalidatedModule = {
        path: string;
        module:CreateReturn<"event"> | CreateReturn<"command">;
        position: number;
    }

    type ModuleExports = Partial<AnyCreateReturn>


    let rawModuleEntries:{  require: ModuleExports | ModuleExports[], path: string}[] = []
    if (args.DEVLOPEMENT_MODE) {
        const dir = args.SOURCE_PATH

        const files = getRecursiveFiles(dir, SOURCE_CODE_FILE_REGEX);
        for (const path of files) {

            const module = require(path);
            
            const content = module && (module.default || module);

            if (content) {
                rawModuleEntries.push({ require: content, path: path });
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
                rawModuleEntries.push({ require: content, path: key });
            } else {
                console.warn(`[WARNING] The file ${key} does not export a valid AccordJS module.`);
            }
        });
    }

    let validatedModules: UnvalidatedModule[] = [];
    for (const item of rawModuleEntries) {
        
        // Check if the item has a require property and if it is an array or a single object
        const isValidModuleExport = (exported: Partial<AnyCreateReturn>): boolean => "type" in exported && "arg" in exported;


        const exported = Array.isArray(item.require) ? item.require : [item.require];

        exported.forEach((module, index) => {
            if (isValidModuleExport(module)) {
                validatedModules.push({ path: item.path, module:module as AnyCreateReturn, position: index + 1 });
            } else {
                console.warn(`[WARNING] The module at ${item.path} [${index + 1}] does not export a valid AccordJS module.`);
                console.warn(`[WARNING] CONTENT : ${JSON.stringify(module)}`);
            }
        });
    }


    const commands: CreateArg<"command">[] = [];
    const commandsToDeploy: any[] = [];
    const events: CreateArg<"event">[] = [];


    for (const item of validatedModules) {
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
            // | data     ->  the data of the command (for discord.js)
            // | execute  ->  the function to execute when the command is triggered
            // | cooldown ->  the cooldown of the command (optional, can be a number or a function)
            // | handler  ->  the function to execute before the command's execute function (optional)

            if (typeof module.arg.data !== 'object' || typeof module.arg.execute !== 'function') {
                console.warn(`[WARNING] The command at ${item.path} [${item.position}] is missing a required "data" or "execute" property. CONTENT : ${JSON.stringify(module.arg)}`);
                continue;
            }

            commands.push(module.arg);
            commandsToDeploy.push(module.arg.data.toJSON());
        }

    }

    // ========================= Deploy Commands ========================

    // Construct and prepare an instance of the REST module
    const rest = new REST().setToken(args.TOKEN);

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
                        Routes.applicationGuildCommands(args.CLIENT_ID, devGuildId),
                        { body: {} }
                    )

                    // The put method is used to fully refresh all commands in the guild with the current set
                    data = await rest.put(
                        Routes.applicationGuildCommands(args.CLIENT_ID, devGuildId),
                        { body: commandsToDeploy },
                    )

                    console.log(`[DEV] Successfully deploy commands in the guild ${devGuildId} : ${(data as Array<any>).length} application (/) commands.`);
                }
            } else {
                console.log(`The methode of deploy application (/) commade is Global deploy.`)
                
                // Clear all commands
                await rest.put(
                    Routes.applicationCommands(args.CLIENT_ID),
                    { body: {} }
                )
        
                // The put method is used to fully refresh all commands in the guild with the current set
                data = await rest.put(
                    Routes.applicationCommands(args.CLIENT_ID),
                    { body: commandsToDeploy },
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

    if (!args.TOKEN) {
        console.error("The Discord Token in env variable is not define !")
        process.exit(1)
    }
    client.login(args.TOKEN)

}
