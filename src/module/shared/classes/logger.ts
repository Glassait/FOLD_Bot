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
     * Log DEBUG
     * @param msg The message of the DEBUG
     * @see LoggerSingleton#debug
     */
    public debug(msg: string): void {
        this.logger.debug(this.context, msg);
    }

    /**
     * Log INFO
     * @param msg The message of the INFO
     * @see LoggerSingleton#info
     */
    public info(msg: string): void {
        this.logger.info(this.context, msg);
    }

    /**
     * Log WARNING
     * @param msg The message of the WARNING
     * @see LoggerSingleton#warning
     */
    public warn(msg: string): void {
        this.logger.warning(this.context, msg);
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
}
