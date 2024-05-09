/**
 * Utility class for handling date-related operations.
 */
export class DateUtil {
    /**
     * Gets the previous month.
     *
     * @returns {Date} - The previous month.
     */
    public static getPreviousMonthAsDate(): Date {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return date;
    }

    /**
     * Gets a formatted string representing the previous month.
     *
     * @returns {string} - A formatted string representing the previous month in the format "Month Year".
     *
     * @example
     * const previousMonth = DateUtil.getPreviousMonth();
     * console.log(previousMonth); // "January 2022"
     */
    public static getPreviousMonth(): string {
        return this.convertDateToMonthYearString(this.getPreviousMonthAsDate());
    }

    /**
     * Gets a formatted string representing the current month.
     *
     * @returns {string} - A formatted string representing the current month in the format "Month Year".
     *
     * @example
     * const currentMonth = DateUtil.getCurrentMonth();
     * console.log(currentMonth); // "February 2022"
     */
    public static getCurrentMonth(): string {
        return this.convertDateToMonthYearString(new Date());
    }

    /**
     * Converts a date object to a formatted string representing the month and year.
     *
     * @param {Date} date - The date object to be converted.
     *
     * @returns {string} - A formatted string representing the month and year of the given date.
     *
     * @example
     * const someDate = new Date();
     * const formattedDate = DateUtil.convertDateToMonthYearString(someDate);
     * console.log(formattedDate); // "February 2022"
     */
    public static convertDateToMonthYearString(date: Date): string {
        return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }

    /**
     * Gets a formatted string representing the current day.
     *
     * @returns {string} - A formatted string representing the current day in the format "dd/mm/yy".
     *
     * @example
     * const currentMonth = DateUtil.getCurrentDay();
     * console.log(currentMonth); // "23/03/24"
     */
    public static getCurrentDay(): string {
        return this.convertDateToDayMonthYearString(new Date());
    }

    /**
     * Gets a formatted string representing the current day.
     *
     * @returns {Date} - The previous day.
     *
     * @example
     * const previousDay = DateUtil.getPreviousDayAsDate();
     * console.log(previousDay); // Tue Apr 30 2024 09:23:35 GMT+0200 (heure d’été d’Europe centrale)
     */
    public static getPreviousDayAsDate(): Date {
        const date: Date = new Date();
        date.setDate(date.getDate() - 1);
        return date;
    }

    /**
     * Gets a formatted string representing the previous day.
     *
     * @returns {string} - A formatted string representing the current day in the format "dd/mm/yy".
     *
     * @example
     * const previousDay = DateUtil.getPreviousDay();
     * console.log(previousDay); // "23/03/24"
     */
    public static getPreviousDay(): string {
        return this.convertDateToDayMonthYearString(this.getPreviousDayAsDate());
    }

    /**
     * Get the correct month for previous day.
     *
     * @return {string} - The current month if the previous day is part of the month, otherwise the previous month
     *
     * @example
     * // Today : 11/06/2024
     * // Yesterday : 10/06/2024
     * const month = DateUtil.getCorrectMonthForPreviousDay();
     * console.log(month); // "June 2024"
     * @example
     * // Today : 01/07/2024
     * // Yesterday : 30/06/2024
     * const month = DateUtil.getCorrectMonthForPreviousDay();
     * console.log(month); // "June 2024"
     */
    public static getCorrectMonthForPreviousDay(): string {
        return new Date().getMonth() !== DateUtil.getPreviousDayAsDate().getMonth() ? this.getPreviousMonth() : this.getCurrentMonth();
    }

    /**
     * Converts a date object to a formatted string representing the day, month and year.
     *
     * @param {Date} date - The date object to be converted.
     *
     * @returns {string} - A formatted string representing the day, month and year of the given date.
     *
     * @example
     * const someDate = new Date();
     * const formattedDate = DateUtil.convertDateToDayMonthYearString(someDate);
     * console.log(formattedDate); // "23/03/24"
     */
    public static convertDateToDayMonthYearString(date: Date): string {
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
    }

    /**
     * Format the date to the following format YYYY-MM-DD
     *
     * @param {Date} date - The date to format
     *
     * @return {string} - The string representation to the date formated in YYYY-MM-DD
     */
    public static formatDateForSql(date: Date): string {
        return `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
    }
}
