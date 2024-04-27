import { existsSync, mkdirSync } from 'fs';
import type { ContextAbstract } from '../abstracts/context.abstract';
import { EmojiEnum } from '../enums/emoji.enum';

/**
 * Class used to manage the persistence of the log
 * This class implement the Singleton pattern
 */
export class LoggerSingleton {
    //region PRIVATE FIELD
    /**
     * The directory where the logs are stored
     */
    private dir: string = './src/logs/';
    /**
     * The path to the log file
     */
    private path: string = `${this.dir}${new Date().toLocaleString('fr-FR').replace(/\//g, '-').replace(/ /g, '_').replace(/:/g, '-')}.md`;
    /**
     * The actual log text
     */
    private log: string = '';
    //endregion

    /**
     * Private constructor for the InventorySingleton class.
     */
    private constructor() {
        this.createLogFile();
    }

    //region SINGLETON
    /**
     * The instance of the class, used for the singleton pattern
     */
    private static _instance: LoggerSingleton | undefined;

    /**
     * Getter for {@link _instance}
     */
    public static get instance(): LoggerSingleton {
        if (!this._instance) {
            this._instance = new LoggerSingleton();
        }
        return this._instance;
    }
    //endregion

    //region LOG-METHODS
    /**
     * Logs a debug message.
     *
     * @param {ContextAbstract} context - The context in which the message is logged.
     * @param {string} msg - The message to log.
     */
    public debug(context: ContextAbstract, msg: string): void {
        // eslint-disable-next-line no-console
        console.debug(`${EmojiEnum.DEBUG} : ${msg}`);
        this.addToLog('DEBUG', context.context, msg);
    }

    /**
     * Logs an info message.
     *
     * @param {ContextAbstract} context - The context in which the message is logged.
     * @param {string} msg - The message to log.
     */
    public info(context: ContextAbstract, msg: string): void {
        // eslint-disable-next-line no-console
        console.info(`${EmojiEnum.INFO} : ${msg}`);
        this.addToLog('INFO', context.context, msg);
    }

    /**
     * Logs a warning message.
     *
     * @param {ContextAbstract} context - The context in which the message is logged.
     * @param {string} msg - The message to log.
     */
    public warning(context: ContextAbstract, msg: string): void {
        // eslint-disable-next-line no-console
        console.warn(`${EmojiEnum.WARNING} : ${msg}`);
        this.addToLog('WARNING', context.context, msg);
    }

    /**
     * Logs an error message.
     *
     * @param {ContextAbstract} context - The context in which the message is logged.
     * @param {string} msg - The message to log.
     */
    public error(context: ContextAbstract, msg: string): void {
        // eslint-disable-next-line no-console
        console.error(`${EmojiEnum.ERROR} : ${msg}`);
        this.addToLog('ERROR', EmojiEnum.ERROR + context.context, msg);
    }
    //endregion

    /**
     * Creates the log file.
     */
    private createLogFile(): void {
        if (!existsSync(this.dir)) {
            mkdirSync(this.dir);
        }

        require('../utils/file.util').FileUtil.writeFile(this.path, this.log);
    }

    /**
     * Adds a message to the log.
     *
     * @param {string} level - The log level.
     * @param {string} context - The context in which the message is logged.
     * @param {string} msg - The message to log.
     */
    private addToLog(level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR', context: string, msg: string): void {
        this.log += `[${new Date().toLocaleString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hourCycle: 'h24',
        })}][${level}][${context}] ${msg.replace(/application_id=[0-9a-z]{32}/, 'application_id=*********')}  \n`;
        require('../utils/file.util').FileUtil.writeFile(this.path, this.log);
    }
}
