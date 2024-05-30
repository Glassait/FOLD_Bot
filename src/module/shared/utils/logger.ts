import { ContextAbstract } from '../abstracts/context.abstract';
import { LoggerSingleton } from '../singleton/logger.singleton';
import { transformToCode } from './string.util';

/**
 * This class use the LoggerSingleton to write log
 */
export class Logger {
    /**
     * The context of the class
     */
    private readonly context: ContextAbstract;
    /**
     * The instance of the {@link LoggerSingleton}
     */
    private readonly logger: LoggerSingleton = LoggerSingleton.instance;

    constructor(context: string | ContextAbstract) {
        if (typeof context === 'string') {
            context = new ContextAbstract(context);
        }

        this.context = context;
    }

    /**
     * Logs a debug message with optional code snippets.
     *
     * @param {string} msg - The main message to log.
     * @param {...unknown} args - Code snippets to include in the message.
     */
    public debug(msg: string, ...args: unknown[]): void {
        this.logger.debug(this.context, transformToCode(msg, ...args));
    }

    /**
     * Logs an info message with optional code snippets.
     *
     * @param {string} msg - The main message to log.
     * @param {...unknown} args - Code snippets to include in the message.
     */
    public info(msg: string, ...args: unknown[]): void {
        this.logger.info(this.context, transformToCode(msg, ...args));
    }

    /**
     * Logs a warning message with optional code snippets.
     *
     * @param {string} msg - The main message to log.
     * @param {...unknown} args - Code snippets to include in the message.
     */
    public warn(msg: string, ...args: unknown[]): void {
        this.logger.warning(this.context, transformToCode(msg, ...args));
    }

    /**
     * Logs an error message along with an optional error stack trace.
     *
     * @param {string} msg - The error message to be logged.
     * @param {unknown} [error] - Optional error object or additional error information.
     */
    public error(msg: string, error?: unknown): void {
        this.logger.error(this.context, `${msg}${error ? '\n' + this.getErrorDetails(error) : ''}`);
    }

    /**
     * Retrieves the details of the error, including the stack trace.
     *
     * @param {unknown} error - The error object or information.
     *
     * @returns {string} - The formatted error details.
     */
    private getErrorDetails(error: unknown): string {
        if (error instanceof Error) {
            return error.stack ?? error.message;
        } else if (typeof error === 'string') {
            return error;
        }

        return JSON.stringify(error);
    }
}
