import { existsSync, mkdirSync, writeFile } from 'fs';
import { Context } from '../utils/context.class';

/**
 * Class used to manage the persistence of the log
 * This class implement the Singleton pattern
 */
export class LoggerSingleton extends Context {
    /**
     * The directory of the logs
     */
    private dir: string = './src/logs/';
    /**
     * The path of the current log.
     * @private
     */
    private path: string = `${this.dir}${new Date().toLocaleString('fr-FR').replace(/\//g, '-').replace(/ /g, '_').replace(/:/g, '-')}.md`;
    /**
     * The log
     * @private
     */
    private log: string = '';

    constructor() {
        super(LoggerSingleton);
    }

    /**
     * The instance of the class, used for the singleton pattern
     * @private
     */
    private static _instance: LoggerSingleton | undefined;

    /**
     * Getter for {@link _instance}
     */
    public static get instance(): LoggerSingleton {
        if (!this._instance) {
            this._instance = new LoggerSingleton();
            this._instance.createLogFile();
        }
        return this._instance;
    }

    /**
     * Create the log directory and file
     * @private
     */
    private createLogFile(): void {
        if (!existsSync(this.dir)) {
            mkdirSync(this.dir);
        }

        writeFile(this.path, this.log, err => {
            if (err) {
                this.error(this, err.message);
                throw err;
            }
            this.info(this, '📁 Log file created');
        });
    }

    /**
     * Write TRACE log in the file
     * @param context The context of the TRACE
     * @param msg The message of the TRACE
     */
    public trace(context: Context, msg: string): void {
        console.debug(msg);
        this.addToLog('TRACE', 'gray', context.context, msg);
    }

    /**
     * Write DEBUG log in the file
     * @param context The context of the DEBUG
     * @param msg The message of the DEBUG
     */
    public debug(context: Context, msg: string): void {
        console.debug(msg);
        this.addToLog('DEBUG', 'grey', context.context, msg);
    }

    /**
     * Write INFO log in the file
     * @param context The context of the INFO
     * @param msg The message of the INFO
     */
    public info(context: Context, msg: string): void {
        console.info(msg);
        this.addToLog('INFO', 'green', context.context, msg);
    }

    /**
     * Write WARNING log in the file
     * @param context The context of the WARNING
     * @param msg The message of the WARNING
     */
    public warning(context: Context, msg: string): void {
        console.warn(msg);
        this.addToLog('WARNING', 'orange', context.context, msg);
    }

    /**
     * Write ERROR log in the file
     * @param context The context of the ERROR
     * @param msg The message of the ERROR
     */
    public error(context: Context, msg: string): void {
        console.error(msg);
        this.addToLog('ERROR', 'red', context.context, msg);
    }

    /**
     * Method who manage the incoming logs
     * Update the log file.
     * @param level The level of the log
     * @param color The color of to write
     * @param context The context of the log
     * @param msg The message of the log
     * @private
     */
    private addToLog(level: 'TRACE' | 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR', color: string, context: string, msg: string): void {
        this.log += `<span style="color:${color}">[${new Date().toLocaleString('fr-FR')}][${level}][${context}] ${msg} </span><br>\n`;
        this.updateFile();
    }

    /**
     * Update the log file
     * @private
     */
    private updateFile(): void {
        writeFile(this.path, this.log, err => {
            if (err) {
                this.warning(this, `🔄❌ Failed to sync the log file with error: ${err}`);
            }
        });
    }
}
