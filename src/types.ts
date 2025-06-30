import { ChatInputApplicationCommandData, ChatInputCommandInteraction, ClientEvents, Events, Interaction, Message, SlashCommandBuilder } from "discord.js"

// #### utils

type keyofClientEvents = keyof ClientEvents;


// #### Create Event function

type EventWithHandler<Event extends keyofClientEvents, T> = {
  name: Event;
  once: boolean;
  handler: Handler<Event, T>;
  execute: (arg: T) => void;
};

type EventWithoutHandler<Event extends keyofClientEvents> = {
  name: Event;
  once: boolean;
  handler?: undefined;
  execute: (...args: ClientEvents[Event]) => void;
};

export type CreateReturn<E extends "event" | "command"> = {
  type: E;
  arg: CreateArg<E>;
  
  // he use of the `default` key is strictly prohibited for reasons of compatibility with the ES MODULE
  default?: never;
}

export type AnyCreateReturn = CreateReturn<"event"> | CreateReturn<"command">;

export type CreateArg<E extends "event" | "command"> = E extends "event" ? EventWithHandler<keyofClientEvents, any> | EventWithoutHandler<keyofClientEvents> : CommandWithHandler | CommandWithoutHandler<any>;

export function createEvent<Event extends keyofClientEvents, T>(
  arg: EventWithHandler<Event, T>
): CreateReturn<"event">;
export function createEvent<Event extends keyofClientEvents>(
  arg: EventWithoutHandler<Event>
): CreateReturn<"event">;
export function createEvent(arg: any) { // Define function
  return { arg: arg, type: "event"}
}

export type Handler<Event extends keyofClientEvents | "SlashCommand", T> = (args: Event extends keyofClientEvents ? (ClientEvents[Event][0]) : ChatInputCommandInteraction) => T | null;

export function createHandler<Event extends keyofClientEvents, T>(
  event:Event, fn: (args: ClientEvents[Event][0]) => T | null
): Handler<Event, T> {
  return fn;
}



/**
 * If number, it is the cooldown in seconds. Else it is a function for the custom cooldown logic.
 */
type Cooldown<T> = number | ((lastUse:Date, now:Date, cooldowns:Record<string, Record<string, Date>>, interaction:T) => boolean)

type CommandWithHandler<T = ChatInputCommandInteraction> = {
  data: SlashCommandBuilder;
  handler?: undefined;
  cooldown?: Cooldown<T>;
  execute: (interaction: T) => void;
}

type CommandWithoutHandler<T> = {
  data: SlashCommandBuilder;
  handler: Handler<"SlashCommand", T>;
  cooldown?: Cooldown<T>;
  execute: (interaction: T) => void;
}

export function createCommand(arg: CommandWithHandler): CreateReturn<"command">;
export function createCommand<T>(arg: CommandWithoutHandler<T>): CreateReturn<"command">;
export function createCommand(arg: any) {
  return { arg: arg, type: "command" };
}
