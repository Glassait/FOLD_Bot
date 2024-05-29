import { basename } from 'node:path';
import { EmojiEnum } from '../enums/emoji.enum';
import { MockEnum } from '../enums/mock.enum';
import { Logger } from './logger';

/**
 * A utility class for environment-related operations.
 */
export class EnvUtil {
    /**
     * A logger instance for the EnvUtil class.
     */
    private static logger: Logger = new Logger(basename(__filename));

    /**
     * Returns a boolean indicating whether the application is running in development mode.
     *
     * @returns {boolean} - True if the application is running in development mode, false otherwise.
     */
    public static isDev(): boolean {
        return process.argv[3] === MockEnum.DEV;
    }

    /**
     * Sleeps for the specified number of milliseconds.
     *
     * @param {number} time - The number of milliseconds to sleep.
     */
    public static async sleep(time: number): Promise<void> {
        this.logger.debug(`${EmojiEnum.SLEEP} Sleeping for ${time / 1000} sec`);
        await new Promise(r => setTimeout(r, time < 0 ? 0 : time));
    }

    /**
     * Creates an asynchronous thread that executes the given function after a specified delay.
     *
     * @param {() => Promise<any>} fun The function to execute asynchronously.
     * @param {number} [delay=0] The delay in milliseconds before executing the function.
     *
     * @example
     * // From a class
     * class Greet {
     *     greet()
     * }
     *
     * const instance = Greet()
     * EnvUtil.asyncThread(instance.greet.bind(instance))
     */
    public static asyncThread(fun: () => Promise<void>, delay: number = 0): void {
        setTimeout(async (): Promise<void> => await fun(), delay);
    }

    /**
     * Creates a thread that executes the given function after a specified delay.
     *
     * @param {() => any} fun The function to execute.
     * @param {number} [delay=0] The delay in milliseconds before executing the function.
     */
    public static thread(fun: () => void, delay: number = 0): void {
        setTimeout((): void => fun(), delay);
    }
}
