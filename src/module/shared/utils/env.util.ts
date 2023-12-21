import { MockEnum } from '../enums/mock.enum';

export class EnvUtil {
    /**
     * Check if the running app is in dev mode
     */
    public static isDev(): boolean {
        return process.argv[3] === MockEnum.DEV;
    }

    /**
     * Sleep method
     * @param time in millis
     */
    public static async sleep(time: number): Promise<void> {
        await new Promise(r => setTimeout(r, time));
    }
}
