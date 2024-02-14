import { Context } from './context';
import { LoggerSingleton } from '../singleton/logger.singleton';

/**
 * This class use the LoggerSingleton to write log
 */
export class Logger {
    /**
     * The context of the class
     * @private
     */
    private readonly context: Context;
    /**
     * The instance of the {@link LoggerSingleton}
     * @private
     */
    private readonly logger: LoggerSingleton = LoggerSingleton.instance;

    constructor(context: Context) {
        this.context = context;
    }

    /**
     * Logs a debug message with optional code snippets.
     *
     * @param {string} msg - The main message to log.
     * @param {...string} args - Code snippets to include in the message.
     */
    public debug(msg: string, ...args: string[]): void {
        this.logger.debug(this.context, this.transformToCode(msg, ...args));
    }

    /**
     * Logs an info message with optional code snippets.
     *
     * @param {string} msg - The main message to log.
     * @param {...string} args - Code snippets to include in the message.
     */
    public info(msg: string, ...args: string[]): void {
        this.logger.info(this.context, this.transformToCode(msg, ...args));
    }

    /**
     * Logs a warning message with optional code snippets.
     *
     * @param {string} msg - The main message to log.
     * @param {...string} args - Code snippets to include in the message.
     */
    public warn(msg: string, ...args: string[]): void {
        this.logger.warning(this.context, this.transformToCode(msg, ...args));
    }

    /**
     * Logs an error message along with an optional error stack trace.
     *
     * @param {string} msg - The error message to be logged.
     * @param {Error | string | any} [error] - Optional error object or additional error information.
     */
    public error(msg: string, error?: Error | string | any): void {
        this.logger.error(this.context, `${msg}${error ? '\n\n' + this.getErrorDetails(error) : ''}`);
    }

    /**
     * Retrieves the details of the error, including the stack trace.
     *
     * @param {Error | string | any} error - The error object or information.
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

    /**
     * Replaces placeholders in a given text with provided code snippets.
     *
     * @param {string} text - The original text containing placeholders.
     * @param {...string} args - Code snippets to replace the placeholders.
     * @returns {string} - The modified text with placeholders replaced.
     */
    private transformToCode(text: string, ...args: string[]): string {
        if (text.split('{}').length > 0 && text.split('{}').length - 1 !== args.length) {
            throw new Error('Mismatch between the number of placeholders and the number of code snippets provided.');
        }

        args.forEach((codeText: string): void => {
            text = text.replace('{}', `\`${codeText}\``);
        });

        return text;
    }
}
