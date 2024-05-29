import type { Condition, OrderBy } from './computer.type';

/**
 * Builder that help to build conditional query like where of inner join.
 */
export class Conditions {
    /**
     * The inner join condition
     */
    protected _innerJoin: { tableName: string; condition: Condition };

    /**
     * The where condition
     */
    protected _where: Condition;

    /**
     * The order by condition
     */
    protected _orderBy: OrderBy[];

    /**
     * The max number of row to show
     */
    protected _limit: number;

    /**
     * Build the condition
     */
    public buildConditions(): string {
        let conditions: string = '';

        if (this._innerJoin) {
            conditions += ` INNER JOIN ${this._innerJoin.tableName} ON ${this.reduceConditionsAndVerdes(this._innerJoin.condition)}`;
        }

        if (this._where) {
            conditions += ' WHERE ' + this.reduceConditionsAndVerdes(this._where);
        }

        if (this._orderBy) {
            conditions +=
                ' ORDER BY ' + this._orderBy.map((by: OrderBy): string => `${by.column} ${by.direction ? by.direction : 'ASC'}`).join(', ');
        }

        if (this._limit) {
            conditions += ` LIMIT ${this._limit}`;
        }

        return conditions;
    }

    /**
     * Sets the WHERE conditions.
     *
     * @param {Condition['conditions']} conditions - The WHERE conditions.
     * @param {Condition['verdes']} [verdes] - The 'OR' or 'AND' operators.
     *
     * @returns {this} - The instance of the class extending the {@link Conditions} class.
     *
     * @throws {Error} - If the length of verde is not equal to the length of conditions minus one.
     *
     * @example
     * new DeleteBuilder('tableName').where([["name LIKE 'John'", 'age = 23' ], ['AND']])
     */
    public where(conditions: Condition['conditions'], verdes?: Condition['verdes']): this {
        if (verdes && verdes.length !== conditions.length - 1) {
            throw new Error('Verde length different of condition length (minus one)');
        }

        this._where = { conditions: conditions };

        if (verdes) {
            this._where.verdes = verdes;
        }

        return this;
    }

    /**
     * Set the INNER JOIN condition
     *
     * @param {string} tableName - The name of the table to join
     * @param {Condition['conditions']} conditions - The conditions.
     * @param {Condition['verdes']} [verdes] - The 'OR' or 'AND' operators.
     *
     * @returns {this} - The instance of the class extending the {@link Conditions} class.
     *
     * @throws {Error} - If the length of verde is not equal to the length of conditions minus one.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected innerJoin(tableName: string, conditions: Condition['conditions'], verdes?: Condition['verdes']): this {
        return this;
    }

    /**
     * Set the ORDER BY conditions
     *
     * @param {OrderBy[]} orders - The order by
     *
     * @returns {this} - The instance of the class extending the {@link Conditions} class.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected orderBy(orders: OrderBy[]): this {
        return this;
    }

    /**
     * Set the LIMIT conditions
     *
     * @param {number} limit - The number of row to show
     *
     * @returns {this} - The instance of the class extending the {@link Conditions} class.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected limit(limit: number): this {
        return this;
    }

    /**
     * Reduces WHERE conditions to a string.
     *
     * @param {Condition} conditions - The condition and verbe to reduce
     *
     * @returns {string} The reduced WHERE conditions string.
     */
    private reduceConditionsAndVerdes(conditions: Condition): string {
        return conditions.conditions.reduce(
            (where: string, condition: string, index: number): string =>
                where +
                condition +
                (conditions.conditions.length > 1 && index <= conditions.conditions.length - 2 ? ` ${conditions.verdes![index]} ` : ''),
            ''
        );
    }
}
