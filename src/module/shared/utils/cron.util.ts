import { CronJob } from 'cron';
import { basename } from 'node:path';
import { EmojiEnum } from '../enums/emoji.enum';
import type { CronName } from '../tables/complexe-table/crons/models/crons.type';
import { Logger } from './logger';

const logger: Logger = new Logger(basename(__filename));

/**
 * Creates a new cron job with the specified cron schedule and callback function.
 *
 * @param {string} cron - The cron expression that defines the schedule.
 * @param {string} name - The name of the cron.
 * @param {() => void} callback - The function to be executed when the cron job runs.
 * @param {boolean} [runOnInit] - Whether the cron job should run immediately upon creation.
 */
export function createCron(cron: string, name: CronName, callback: () => void | Promise<void>, runOnInit?: boolean): void {
    CronJob.from({
        cronTime: cron,
        onTick: async (): Promise<void> => {
            logger.info(`${EmojiEnum.LOOP} {} loop start at {}`, name, new Date().toISOString());
            await callback();
        },
        start: true,
        timeZone: 'system',
        runOnInit,
        onComplete: (): void => {
            logger.info('The cron {} finish executing', name);
        },
    });
}
