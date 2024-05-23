import { CronJob } from 'cron';

/**
 * Utility class for creating and managing cron jobs.
 */
export class CronUtil {
    /**
     * Creates a new cron job with the specified cron schedule and callback function.
     *
     * @param {string} cron - The cron expression that defines the schedule.
     * @param {() => void} callback - The function to be executed when the cron job runs.
     * @param {boolean} [runOnInit] - Whether the cron job should run immediately upon creation.
     */
    public static createCron(cron: string, callback: () => void, runOnInit?: boolean): void {
        CronJob.from({
            cronTime: cron,
            onTick: callback,
            start: true,
            timeZone: 'system',
            runOnInit: runOnInit,
        });
    }
}
