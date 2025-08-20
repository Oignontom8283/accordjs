import fs from 'fs';
import path from 'path';
import { Client, Events, REST, Routes } from "discord.js";
import { AnyCreateReturn, AnyEvent, NormalizedModule, ValidatedModule, Config, RawModuleEntry, AnyCommand } from "./types";

export function deployEvent(client: Client, event: AnyEvent): { eventName: string, listener: (...args: any[]) => void } {

    // Create the listener function
    const listener = (...args: any[]) => {

        if (event.handler) { // If a handler is defined
            const out = event.handler(args[0]);
            if (out !== null) {
                event.execute(out);
            }
        } else {
            event.execute(args[0]);
        }
    };

    if (event.once) {
        client.once(event.name, listener);
    } else {
        client.on(event.name, listener);
    }

    // Return the reference to the listener
    return { eventName: event.name, listener };
}

/**
 * Recursively retrieves all file paths from a directory, applying optional filters for files and folders.
 *
 * @param dir - The root directory to start searching from.
 * @param fileFiltre - Optional regular expression to filter file **names**. Defaults to matching all files.
 * @param folderFiltre - Optional regular expression to filter folder **names**. Defaults to matching all folders.
 * @returns An array of file paths that match the specified filters.
 */
export function getAllFilesRecursive(dir: string, fileFiltre: RegExp = /^.*$/, folderFiltre: RegExp = /^.*$/): string[] {
    const results: string[] = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (folderFiltre.test(path.basename(fullPath))) {
                results.push(...getAllFilesRecursive(fullPath, fileFiltre, folderFiltre));
            }
        } else if (fileFiltre.test(path.basename(fullPath))) {
            results.push(fullPath);
        }
    }

    return results;
}

/**
 * Dynamically loads a module from the specified file path.
 *
 * This function supports both CommonJS (`require`) and ECMAScript Modules (`import`).
 * It detects the module system at runtime and loads the module accordingly.
 * 
 * I use this method to dynamically import any file from any type of Node.js project, whether it uses CommonJS or ESM.
 * This approach ensures compatibility and flexibility, allowing the code to load modules regardless of the project's module system or file structure.
 *
 * @param filePath - The path to the module file to load.
 * @returns A promise that resolves to the loaded module.
 */
export async function loadModuleFromFile(filePath: string) {
    if (typeof require !== "undefined") {
        // CommonJS
        return require(filePath);
    } else {
        // ESM
        return (await import(filePath)).default || await import(filePath);
    }
}

export function ensureFramworkModule(module: any): AnyCreateReturn {

    if (!module || typeof module !== 'object') {
        throw new Error(`Module is not a valid AccordJS module.`);
    }

    if (!('type' in module) || !['event', 'command'].includes(module.type)) {
        throw new Error(`Module does not have a valid 'type' property.`);
    }

    if (!('arg' in module)) {
        throw new Error(`Module does not have an 'arg' property.`);
    }

    return module as AnyCreateReturn;
}

export async function syncCommands(config: Config, commands: CommandListeElement[], guilds?: string[]) {

    // Map the command data for discord API declaration
    const commandDatas = commands.map(item => item.command.data.toJSON());

    // Create a REST client for interacting with the Discord API
    const rest = new REST().setToken(config.token);

    // Check if guilds are specified, if so, deploy commands to each guild
    if (guilds) {

        // Iterate over each specified guild
        for (const guildId of guilds) {

            // Clear all commands of the guild
            await rest.put(
                Routes.applicationGuildCommands(config.clientId, guildId),
                { body: {} }
            )

            // The put method is used to fully refresh all commands in the guild with the current set
            const data = await rest.put(
                Routes.applicationGuildCommands(config.clientId, guildId),
                { body: commandDatas },
            )
        }

    }
    // If no guilds are specified, deploy globally
    else {

        // Clear all commands
        await rest.put(
            Routes.applicationCommands(config.clientId),
            { body: {} }
        )

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            Routes.applicationCommands(config.clientId),
            { body: commandDatas },
        );
    };

};

export function bindCommandHandlers(client:Client, commandsElements:CommandListeElement[]) {

    // Listen for interaction events
    client.on(Events.InteractionCreate, async (interaction) => {

        // Check if the interaction is a command
        if (!interaction.isCommand()) return;

        // Find the command element
        try {
            const commandName = interaction.commandName;

            // Find the command element
            const commandElement = commandsElements.find(cmd => cmd.command.data.name === commandName);
            
            if (!commandElement) {
                // if command element not found, log a warning
                console.warn(`Command element not found for command: ${commandName}`);
                return;
            }

            // Execute the command
            commandElement.command.execute(interaction as any); // TODO: Find and fix the type compatibility issue
        } catch (error) {

            // Log the error
            console.error(`Error executing command ${interaction.commandName} user:${interaction.user.id} guild:${interaction.guild ? interaction.guild.id : 'None'}:`, error);

            // Send an error response
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    });
}


type CommandListeElement = { command: AnyCommand, path: string };
type EventListeElement = { event: AnyEvent, path: string };

export function start(config:Config, rawModuleEntry:RawModuleEntry[], devMod:boolean = false, devGuilds?: string[]) {

    // Create an array to hold the processed modules
    const normalizedModule:NormalizedModule[] = [];
    for (const item of rawModuleEntry) {
        if (Array.isArray(item.module)) {
            item.module.forEach((mod, index) => {
                normalizedModule.push({ module: mod, path: item.path, index });
            })
        } else {
            normalizedModule.push({ module: item.module, path: item.path, index: 0 });
        }
    }

    // Validate args and set types
    const validatedModule:ValidatedModule[] = [];
    for (const item of normalizedModule) {
        try {
            const mod = ensureFramworkModule(item.module);
            validatedModule.push({ module: mod, path: item.path, index: item.index });
        } catch (error) {
            // If the module is invalid, log the error and not push it to the array
            console.error(`Error processing module in ${item.path} at [${item.index}]:`, error);
        }
    }


    // Type guards for module types
    const isEvent = (item: ValidatedModule): item is ValidatedModule & { module: { type: "event" } } => item.module.type === "event";
    const isCommand = (item: ValidatedModule): item is ValidatedModule & { module: { type: "command" } } => item.module.type === "command";

    // Separate the modules into their respective types
    const events:EventListeElement[] = validatedModule.filter(isEvent).map(item => ({event: item.module.arg, path: item.path}));
    const commands:CommandListeElement[] = validatedModule.filter(isCommand).map(item => ({command: item.module.arg, path: item.path}));

    // Deploy the events
    const eventsListeners: (ReturnType<typeof deployEvent> & { path: string })[] = []
    for (const event of events) {
        // Deploy the event and store the result
        const result = deployEvent(config.client, event.event)

        // Store the result along with the event path
        eventsListeners.push({...result, path: event.path});
    }


}