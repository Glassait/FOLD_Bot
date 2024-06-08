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
export function transformToCode(text: string, ...args: any[]): string {
    if (!args.length) {
        return text;
    }

    if ((text.match(/{}/g) ?? []).length !== args.length) {
        throw new Error('Mismatch between the number of placeholders and the number of code snippets provided.');
    }

    return text.replace(/{}/g, (): string => `\`${args.shift()}\``);
}

/**
 * Sanitizes a string by removing quotation marks (`"` and `'`).
 *
 * @param {string} text The string to be sanitized.
 *
 * @returns {string} The sanitized string with quotation marks (`"` and `'`) removed.
 *
 * @description
 * This function removes quotation marks (`"` and `'`) from a string. This can be useful for security purposes to prevent potential XSS (Cross-Site Scripting) attacks. However, it's important to note that this method provides a basic level of sanitization and might not be sufficient for all scenarios.
 *
 * @warning This method only removes quotation marks and does not address all potential XSS vulnerabilities.
 *
 * @example
 * const userInput = '"This string contains <script>alert("XSS!")</script>"';
 * const sanitizedString = sanitize(userInput);
 * console.log(sanitizedString); // Output: This string contains  alert("XSS!")
 */
export function sanitize(text: string): string {
    if (!text) {
        return text;
    }

    return text.trim().replace(/["']/g, '');
}

/**
 * Escapes special characters in a string to be safely used within other contexts.
 *
 * @param {string} text The string to be escaped.
 *
 * @returns {string} The escaped string with quotation marks (`"` and `'`) replaced with their escaped versions (`\"` and `\'`).
 *
 * @description
 * This function escapes quotation marks (`"` and `'`) within a string to prevent them from being interpreted literally when the string is used in other contexts, such as within HTML attributes or JavaScript code strings.
 *
 * @example
 * const unescapedString = 'This string contains "double quotes"';
 * const escapedString = escape(unescapedString);
 * console.log(escapedString); // Output: This string contains \"double quotes\"
 */
export function escape(text: string): string {
    if (!text) {
        return text;
    }

    return text.trim().replace(/"/g, '\\"').replace(/'/g, "\\'");
}
