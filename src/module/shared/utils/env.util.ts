import { MockEnum } from '../enums/mock.enum';
import { Logger } from '../classes/logger';
import { Context } from '../classes/context';

/**
 * A utility class for environment-related operations.
 */
export class EnvUtil {
    /**
     * A logger instance for the EnvUtil class.
     * @private
     */
    private static logger: Logger = new Logger(new Context('ENV-UTIL'));

    /**
     * Returns a boolean indicating whether the application is running in development mode.
     * @returns True if the application is running in development mode, false otherwise.
     */
    public static isDev(): boolean {
        return process.argv[3] === MockEnum.DEV;
    }

    /**
     * Sleeps for the specified number of milliseconds.
     * @param time The number of milliseconds to sleep.
     */
    public static async sleep(time: number): Promise<void> {
        this.logger.debug('😴 Sleeping for ' + time / 1000 + ' s');
        await new Promise(r => setTimeout(r, time < 0 ? 0 : time));
    }
}
