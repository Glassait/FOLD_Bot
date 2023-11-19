import { existsSync, mkdirSync, readFileSync, writeFile } from 'fs';
import { Context } from '../utils/context.class';

export class LoggerSingleton extends Context {
    public static dir: string = './src/logs/';
    public static path: string = `${LoggerSingleton.dir}${new Date()
        .toLocaleString('fr-FR')
        .replace(/\//g, '-')
        .replace(/ /g, '_')
        .replace(/:/g, '-')}.md`;
    private _log: string;

    constructor() {
        super(LoggerSingleton);
        this._log = '';
    }

    private static _instance: LoggerSingleton | undefined;

    public static get instance(): LoggerSingleton {
        if (!this._instance) {
            this._instance = new LoggerSingleton();
        }
        return this._instance;
    }

    public createLogFile(): void {
        if (!existsSync(LoggerSingleton.dir)) {
            mkdirSync(LoggerSingleton.dir);
        }

        try {
            const log: Buffer = readFileSync(LoggerSingleton.path);

            if (log.toString()) {
                this._log = log.toString();
            }
        } catch (e) {
            writeFile(LoggerSingleton.path, this._log, err => {
                if (err) {
                    throw err;
                }
                this.debug(this.context, '📁 Log file created');
            });
        }
    }

    public debug(context: string, msg: string): void {
        console.debug(msg);
        this.addToLog('DEBUG', 'grey', context, msg);
    }

    public info(context: string, msg: string): void {
        console.info(msg);
        this.addToLog('INFO', 'green', context, msg);
    }

    public warning(context: string, msg: string): void {
        console.warn(msg);
        this.addToLog('WARNING', 'orange', context, msg);
    }

    public error(context: string, msg: string): void {
        console.error(msg);
        this.addToLog('ERROR', 'red', context, msg);
    }

    private addToLog(
        action: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR',
        color: string,
        context: string,
        msg: string
    ): void {
        this._log += `<span style="color:${color}">[${new Date().toLocaleString(
            'fr-FR'
        )}][${action}][${context}] ${msg} </span><br>`;
        this.updateFile();
    }

    private updateFile(): void {
        writeFile(LoggerSingleton.path, this._log, err => {
            if (err) {
                this.warning(this.context, `🔄❌ Failed to sync the log file with error: ${err}`);
            }
        });
    }
}
