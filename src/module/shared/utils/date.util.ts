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
