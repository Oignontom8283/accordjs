import fs from 'fs';
import path from 'path';
import 'coloriz'
// ############################################################################
// ###                                                                      ###
// ###   This file contains the Logger class used internally by AccordJS.   ###
// ###                                                                      ###
// ############################################################################



/**
 * Represents the available logging levels for controlling log output.
 * 
 * The `LogLevel` enum defines the severity or verbosity of log messages:
 * - `OFF`   (-1): Disables all logging.
 * - `LOG`   (0):  Standard log messages.
 * - `ERROR` (1):  Error messages indicating failures.
 * - `WARN`  (2):  Warning messages for potential issues.
 * - `INFO`  (3):  Informational messages.
 * - `DEBUG` (4):  Debugging messages for development.
 * - `TRACE` (5):  Most detailed messages, typically for tracing program flow.
 */
export enum LogLevel {
    "OFF" = -1,
    "LOG" = 0,
    "ERROR" = 1,
    "WARN" = 2,
    "INFO" = 3,
    "DEBUG" = 4,
    "TRACE" = 5
}


/**
 * # Provides static logging methods with configurable log levels and color-coded output.
 * 
 * The `Logger` class allows logging messages at various severity levels (ERROR, WARN, INFO, DEBUG, TRACE, LOG).
 * Messages are only displayed if their level is at or above the currently set log level.
 * 
 * Log levels can be set and retrieved using `setLogLevel` and `getLogLevel`.
 * Each log method (`error`, `warn`, `info`, `debug`, `trace`, `log`) corresponds to a specific log level.
 * 
 * Color coding is applied to error and warning messages if supported by the environment.
 * 
 * --- 
 *
 * ## Example usage :
 * ```typescript
 * Logger.setLogLevel(LogLevel.DEBUG);
 * Logger.info("Application started");
 * Logger.error("An error occurred");
 * ```
 */
export default class Logger {

    /**
     * The current log level. Messages below this level will not be displayed.
     * Default is LogLevel.INFO.
     */
    private static logLevel: LogLevel = LogLevel.INFO;

    /**
     * Sets the current log level. Only messages at or above this level will be logged.
     * @param level - The desired log level.
     */
    public static setLogLevel(level: LogLevel) {
        this.logLevel = level;
    }

    /**
     * Gets the current log level.
     * @returns The current log level.
     */
    public static getLogLevel(): LogLevel {
        return this.logLevel;
    }

    /**
     * Displays a log message if its level is at or above the current log level.
     * Formats the message and applies color coding for certain levels.
     * @param level - The log level of the message.
     * @param messages - The message(s) to log.
     */
    private static displayMessage(level: LogLevel, messages: any[]) {
        if (level > this.logLevel) {
            return;
        }

        // Joins all messages into a single string.
        const message = messages.map(msg => msg.toString()).join(' ');
        const levelName = LogLevel[level].toUpperCase();
        const text = `[${levelName}] ${message}`;

        // Outputs the message to the appropriate console method, with color if supported.
        switch (level) {
            case LogLevel.ERROR:
                console.error(text.red); // Red color for errors
                break;
            case LogLevel.WARN:
                console.warn(text.yellow); // Yellow color for warnings
                break;
            case LogLevel.INFO:
                console.info(text);
                break;
            case LogLevel.DEBUG:
                console.debug(text);
                break;
            case LogLevel.TRACE:
                console.trace(text);
                break;
            default:
                console.log(text);
        }
    }

    /**
     * Logs an error message. Always uses the ERROR log level.
     * @param messages - The message(s) to log.
     */
    public static error(...messages: any[]) {
        this.displayMessage(LogLevel.ERROR, messages);
    }

    /**
     * Logs a warning message. Always uses the WARN log level.
     * @param messages - The message(s) to log.
     */
    public static warn(...messages: any[]) {
        this.displayMessage(LogLevel.WARN, messages);
    }

    /**
     * Logs an informational message. Always uses the INFO log level.
     * @param messages - The message(s) to log.
     */
    public static info(...messages: any[]) {
        this.displayMessage(LogLevel.INFO, messages);
    }

    /**
     * Logs a debug message. Always uses the DEBUG log level.
     * @param messages - The message(s) to log.
     */
    public static debug(...messages: any[]) {
        this.displayMessage(LogLevel.DEBUG, messages);
    }

    /**
     * Logs a trace message. Always uses the TRACE log level.
     * @param messages - The message(s) to log.
     */
    public static trace(...messages: any[]) {
        this.displayMessage(LogLevel.TRACE, messages);
    }

    /**
     * Logs a message using the default console.log, if the current log level allows it.
     * This method is less strict than the others and does not format the message.
     * @param messages - The message(s) to log.
     */
    public static log(...messages: any[]) {
        if (this.logLevel < LogLevel.LOG) return;

        console.log(...messages)
    }

}

