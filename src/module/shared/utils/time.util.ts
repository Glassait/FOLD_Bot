import { TimeEnum } from '../enums/time.enum';

export class TimeUtil {
    /**
     * Convert a Date object to a Unix timestamp
     * @param date - the Date object to convert
     * @returns the Unix timestamp
     */
    public static convertToUnix(date: Date): number {
        return Math.floor(date.getTime() / TimeEnum.SECONDE);
    }
}
