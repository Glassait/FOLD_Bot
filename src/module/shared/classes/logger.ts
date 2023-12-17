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
     * Log TRACE
     * @param msg The message of the TRACE
     * @see LoggerSingleton#trace
     */
    public trace(msg: string): void {
        this.logger.trace(this.context, msg);
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
    public warning(msg: string): void {
        this.logger.warning(this.context, msg);
    }

    /**
     * Log ERROR
     * @param msg The message of the ERROR
     * @see LoggerSingleton#Error
     */
    public error(msg: string): void {
        this.logger.error(this.context, msg);
    }
}
