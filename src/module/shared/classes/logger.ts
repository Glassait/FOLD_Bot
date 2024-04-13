import { LoggerSingleton } from '../singleton/logger.singleton';
import { StringUtil } from '../utils/string.util';
import { Context } from './context';

/**
 * This class use the LoggerSingleton to write log
 */
export class Logger {
    /**
     * The context of the class
     */
    private readonly context: Context;
    /**
     * The instance of the {@link LoggerSingleton}
     */
    private readonly logger: LoggerSingleton = LoggerSingleton.instance;

    constructor(context: string | Context) {
        if (typeof context === 'string') {
            context = new Context(context);
        }

        this.context = context;
    }

    /**
     * Logs a debug message with optional code snippets.
     *
     * @param {string} msg - The main message to log.
     * @param {...string} args - Code snippets to include in the message.
     */
    public debug(msg: string, ...args: any[]): void {
        this.logger.debug(this.context, StringUtil.transformToCode(msg, ...args));
    }

    /**
     * Logs an info message with optional code snippets.
     *
     * @param {string} msg - The main message to log.
     * @param {...string} args - Code snippets to include in the message.
     */
    public info(msg: string, ...args: any[]): void {
        this.logger.info(this.context, StringUtil.transformToCode(msg, ...args));
    }

    /**
     * Logs a warning message with optional code snippets.
     *
     * @param {string} msg - The main message to log.
     * @param {...string} args - Code snippets to include in the message.
     */
    public warn(msg: string, ...args: any[]): void {
        this.logger.warning(this.context, StringUtil.transformToCode(msg, ...args));
    }

    /**
     * Logs an error message along with an optional error stack trace.
     *
     * @param {string} msg - The error message to be logged.
     * @param {Error | string | any} [error] - Optional error object or additional error information.
     */
    public error(msg: string, error?: Error | string | any): void {
        this.logger.error(this.context, `${msg}${error ? '\n' + this.getErrorDetails(error) : ''}`);
    }

    /**
     * Retrieves the details of the error, including the stack trace.
     *
     * @param {Error | string | any} error - The error object or information.
     *
     * @returns {string} - The formatted error details.
     */
    private getErrorDetails(error: Error | string | any): string {
        if (error instanceof Error) {
            return error.stack ?? error.message;
        } else if (typeof error === 'string') {
            return error;
        } else {
            return JSON.stringify(error);
        }
    }
}
