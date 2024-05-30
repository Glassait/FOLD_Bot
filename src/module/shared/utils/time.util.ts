import { TimeEnum } from '../enums/time.enum';

/**
 * Convert a JavaScript Date object to Unix timestamp (seconds since epoch).
 *
 * @param {Date} date - The Date object to be converted.
 * @returns {number} - The Unix timestamp representing the input date in seconds.
 *
 * @example
 * const inputDate = new Date('2024-02-05T12:30:00Z');
 * const unixTimestamp = TimeUtil.convertToUnix(inputDate);
 * console.log(unixTimestamp); // Output: 1704641400
 */
export function convertToUnix(date: Date): number {
    return Math.floor(date.getTime() / TimeEnum.SECONDE);
}
