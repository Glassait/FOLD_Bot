export class StringUtil {
    /**
     * Transforms a template string containing placeholders ({}) into a formatted code string.
     *
     * Each occurrence of '{}' in the template string will be replaced by the corresponding code snippet provided.
     *
     * If the number of placeholders does not match the number of code snippets provided, an error will be thrown.
     *
     * @param {string} text - The template string containing placeholders.
     * @param {string[]} args - The code snippets to replace the placeholders.
     *
     * @returns {string} - The formatted code string.
     *
     * @throws {Error} - If the number of placeholders does not match the number of code snippets provided.
     *
     * @example
     * const toPlaceInCode = "MusaRoy";
     * const text = "The player {} win the tournament";
     * console.log(StringUtil.transformToCode(text, toPlaceInCode)); // OUTPUT: "The player `MusaRoy` win the tournament"
     *
     * @example
     * const text = "The player {} win the tournament";
     * console.log(StringUtil.transformToCode(text)); // ERROR: Mismatch between the number of placeholders and the number of code snippets provided.
     */
    public static transformToCode(text: string, ...args: any[]): string {
        if ((text.match(/{}/g) || []).length !== args.length) {
            throw new Error('Mismatch between the number of placeholders and the number of code snippets provided.');
        }

        return text.replace(/{}/g, (): string => `\`${args.shift()}\``);
    }

    /**
     * Sanitizes a string by removing leading and trailing whitespace, as well as single and double quotes.
     *
     * @param {string} text - The text to sanitize.
     *
     * @returns {string} - The sanitized text.
     */
    public static sanitize(text: string): string {
        return text.trim().replace(/["']/g, '');
    }
}
