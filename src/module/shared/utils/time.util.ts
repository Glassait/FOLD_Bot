import { TimeEnum } from '../enums/time.enum';
import { EnvUtil } from './env.util';
import { Logger } from '../classes/logger';
import { Context } from '../classes/context';

export class TimeUtil {
    private static readonly logger = new Logger(new Context('Time-UTIL'));

    /**
     * Convert a JavaScript Date object to Unix timestamp (seconds since epoch).
     *
     * @param {Date} date - The Date object to be converted.
     * @returns {number} - The Unix timestamp representing the input date in seconds.
     *
     * @static
     * @public
     *
     * @example
     * // Example usage:
     * const inputDate = new Date('2024-02-05T12:30:00Z');
     * const unixTimestamp = TimeUtil.convertToUnix(inputDate);
     * console.log(unixTimestamp); // Output: 1704641400
     */
    public static convertToUnix(date: Date): number {
        return Math.floor(date.getTime() / TimeEnum.SECONDE);
    }

    /**
     * Execute a callback function at scheduled intervals based on a given array of time schedules.
     *
     * @param {string[]} scheduler - An array of time schedules in the format 'HH:mm'.
     * @param {string} loopName - A descriptive name for the loop.
     * @param {() => Promise<void>} callback - The callback function to be executed at each scheduled interval.
     * @returns {Promise<void>} - A Promise that resolves when all scheduled intervals are completed.
     *
     * @async
     * @static
     * @public
     *
     * @example
     * // Example usage:
     * const scheduler = ['12:00', '15:30', '18:45'];
     * const loopName = 'MyLoop';
     * const callback = async () => {
     *   // Your asynchronous logic here
     *   console.log(`${loopName} loop executed.`);
     * };
     * await TimeUtil.forLoopTimeSleep(scheduler, loopName, callback);
     */
    public static async forLoopTimeSleep(scheduler: string[], loopName: string, callback: () => Promise<void>): Promise<void> {
        for (const schedule of scheduler) {
            const startDate = new Date();
            const targetDate = new Date();
            const date = schedule.split(':');
            targetDate.setHours(Number(date[0]), Number(date[1]) || 0, 0, 0);
            this.logger.info(`${loopName} loop start at ${targetDate}`);
            const time = targetDate.getTime() - startDate.getTime();

            if (time > 0) {
                await EnvUtil.sleep(time);

                await callback();
            }
        }
    }
}
