import { existsSync, mkdirSync, writeFile } from 'fs';
import { Context } from '../utils/context.class';

export class LoggerSingleton extends Context {
    public dir: string = './src/logs/';
    public path: string = `${this.dir}${new Date().toLocaleString('fr-FR').replace(/\//g, '-').replace(/ /g, '_').replace(/:/g, '-')}.md`;
    private log: string = '';

    constructor() {
        super(LoggerSingleton);
    }

    private static _instance: LoggerSingleton | undefined;

    public static get instance(): LoggerSingleton {
        if (!this._instance) {
            this._instance = new LoggerSingleton();
            this._instance.createLogFile();
        }
        return this._instance;
    }

    private createLogFile(): void {
        if (!existsSync(this.dir)) {
            mkdirSync(this.dir);
        }

        writeFile(this.path, this.log, err => {
            if (err) {
                throw err;
            }
            this.info(this, '📁 Log file created');
        });
    }

    public trace(context: Context, msg: string): void {
        console.debug(msg);
        this.addToLog('TRACE', 'gray', context.context, msg);
    }

    public debug(context: Context, msg: string): void {
        console.debug(msg);
        this.addToLog('DEBUG', 'grey', context.context, msg);
    }

    public info(context: Context, msg: string): void {
        console.info(msg);
        this.addToLog('INFO', 'green', context.context, msg);
    }

    public warning(context: Context, msg: string): void {
        console.warn(msg);
        this.addToLog('WARNING', 'orange', context.context, msg);
    }

    public error(context: Context, msg: string): void {
        console.error(msg);
        this.addToLog('ERROR', 'red', context.context, msg);
    }

    private addToLog(action: 'TRACE' | 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR', color: string, context: string, msg: string): void {
        this.log += `<span style="color:${color}">[${new Date().toLocaleString('fr-FR')}][${action}][${context}] ${msg} </span><br>\n`;
        this.updateFile();
    }

    private updateFile(): void {
        writeFile(this.path, this.log, err => {
            if (err) {
                this.warning(this, `🔄❌ Failed to sync the log file with error: ${err}`);
            }
        });
    }
}
