/**
 * This type represent the data for a SQL condition
 */
export type Condition = {
    /**
     * An array of conditions used to form the SQL condition (like WHERE).
     *
     * Each string in the array represents a single condition.
     *
     * @example
     * ["id = 1"]
     *
     * @example
     * ["id = 1", "name = John"]
     */
    conditions: string[];
    /**
     * This property link two by two conditions in the {@link conditions}.
     *
     * The array need to be the same length as {@link conditions} minus one.
     *
     * @optional
     *
     * @example
     * ["AND"]
     */
    verdes?: ('AND' | 'OR')[];
};

/**
 * This type represent the couple column - direction to order a sql table with
 *
 * @example
 * [
 *     {
 *         column: "name"
 *     },
 *     {
 *         column: "date",
 *         direction: 'DESC'
 *     }
 * ]
 */
export type OrderBy = {
    /**
     * The name of the column
     */
    column: string;
    /**
     * The direction to order. This is optional, if not give, the direction 'ASC' is used
     */
    direction?: 'ASC' | 'DESC';
};
