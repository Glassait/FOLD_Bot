export interface ComputeInterface {
    /**
     * Compute the builder to a SQL query
     *
     * @return {string} - The generated SQL query
     */
    compute(): string;
}

export interface ColumnsInterface {
    /**
     * Set the columns for the SQL query
     *
     * @param {string[]} columns - The list of columns for the SQL query
     *
     * @return {this} - An instance of the class implementing the {@link ColumnsInterface}
     */
    columns(...columns: string[]): this;
}

export interface ValuesInterface {
    /**
     * Set the values to add in the table for the SQL query
     *
     * @param {any[]} values - The list of value to add in the stable for the SQL query
     *
     * @return {this} - An instance of the class implementing the {@link ValuesInterface}
     */
    values(...values: any[]): this;
}
