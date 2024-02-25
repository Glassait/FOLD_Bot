/**
 * Utility class for handling date-related operations.
 */
export class DateUtil {
    /**
     * Gets a formatted string representing the previous month.
     *
     * @returns {string} - A formatted string representing the previous month in the format "Month Year".
     *
     * @example
     * ```typescript
     * const previousMonth = DateUtil.getPreviousMonth();
     * console.log(previousMonth); // "January 2022"
     * ```
     */
    public static getPreviousMonth(): string {
        const month = new Date();
        month.setMonth(month.getMonth() - 1);
        return this.convertDateToMonthYearString(month);
    }

    /**
     * Gets a formatted string representing the current month.
     *
     * @returns {string} - A formatted string representing the current month in the format "Month Year".
     *
     * @example
     * ```typescript
     * const currentMonth = DateUtil.getCurrentMonth();
     * console.log(currentMonth); // "February 2022"
     * ```
     */
    public static getCurrentMonth(): string {
        return this.convertDateToMonthYearString(new Date());
    }

    /**
     * Converts a date object to a formatted string representing the month and year.
     *
     * @param {Date} date - The date object to be converted.
     * @returns {string} - A formatted string representing the month and year of the given date.
     *
     * @example
     * ```typescript
     * const someDate = new Date();
     * const formattedDate = DateUtil.convertDateToMonthYearString(someDate);
     * console.log(formattedDate); // "February 2022"
     * ```
     */
    public static convertDateToMonthYearString(date: Date): string {
        return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }
}
