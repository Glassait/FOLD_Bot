import { basename } from 'node:path';
import { EmojiEnum } from '../enums/emoji.enum';
import { MockEnum } from '../enums/mock.enum';
import { Logger } from './logger';

/**
 * A logger instance for the EnvUtil class.
 */
const logger: Logger = new Logger(basename(__filename));

/**
 * Returns a boolean indicating whether the application is running in development mode.
 *
 * @returns {boolean} - True if the application is running in development mode, false otherwise.
 */
export function isDev(): boolean {
    return process.argv[3] === MockEnum.DEV;
}

/**
 * Sleeps for the specified number of milliseconds.
 *
 * @param {number} time - The number of milliseconds to sleep.
 */
export async function sleep(time: number): Promise<void> {
    logger.debug(`${EmojiEnum.SLEEP} Sleeping for ${time / 1000} sec`);
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
export function asyncThread(fun: () => Promise<void>, delay: number = 0): void {
    setTimeout(async (): Promise<void> => await fun(), delay);
}

/**
 * Creates a thread that executes the given function after a specified delay.
 *
 * @param {() => any} fun The function to execute.
 * @param {number} [delay=0] The delay in milliseconds before executing the function.
 */
export function thread(fun: () => void, delay: number = 0): void {
    setTimeout((): void => fun(), delay);
}
