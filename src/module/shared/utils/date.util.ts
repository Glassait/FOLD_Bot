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
     * const previousMonth = DateUtil.getPreviousMonth();
     * console.log(previousMonth); // "January 2022"
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
     * @returns {string} - A formatted string representing the current day in the format "dd/mm/yy".
     *
     * @example
     * const currentMonth = DateUtil.getCurrentDay();
     * console.log(currentMonth); // "23/03/24"
     */
    public static getPreviousDay(): string {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        return this.convertDateToDayMonthYearString(date);
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
}
