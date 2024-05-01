/**
 * Utility class for mathematical operations.
 */
export class MathUtil {
    /**
     * Retrieves the minimum value of a specified property from an array of objects.
     *
     * @param {T[]} arr - The array of objects.
     * @param {keyof T} property - The property to extract the values from.
     *
     * @returns {number} - The minimum value.
     *
     * @throws {Error} - If the property does not exist in the objects or if the values are not numbers.
     *
     * @template T - The type of objects in the array.
     *
     * @example
     * const objects = [{ value: 5 }, { value: 10 }, { value: 3 }];
     * const minValue = MathUtil.getMinFromArrayOfObject(objects, 'value');
     * console.log(minValue); // Output: 3
     */
    public static getMinFromArrayOfObject<T>(arr: T[], property: keyof T): number {
        const values: T[keyof T][] = arr
            .flatMap((obj: T) => obj[property])
            .filter((value: T[keyof T]): boolean => typeof value === 'number');
        if (!values.every((val: T[keyof T]): boolean => typeof val === 'number')) {
            throw new Error('Property values must be numbers.');
        }
        return Math.min(...(values as number[]));
    }

    /**
     * Retrieves the maximum value of a specified property from an array of objects.
     *
     * @param {T[]} arr - The array of objects.
     * @param {keyof T} property - The property to extract the values from.
     *
     * @returns {number} - The maximum value.
     *
     * @throws {Error} - If the property does not exist in the objects or if the values are not numbers.
     *
     * @template T - The type of objects in the array.
     *
     * @example
     * const objects = [{ value: 5 }, { value: 10 }, { value: 3 }];
     * const maxValue = MathUtil.getMaxFromArrayOfObject(objects, 'value');
     * console.log(maxValue); // Output: 10
     */
    public static getMaxFromArrayOfObject<T>(arr: T[], property: keyof T): number {
        const values: T[keyof T][] = arr
            .flatMap((obj: T) => obj[property])
            .filter((value: T[keyof T]): boolean => typeof value === 'number');
        if (!values.every((val: T[keyof T]): boolean => typeof val === 'number')) {
            throw new Error('Property values must be numbers.');
        }
        return Math.max(...(values as number[]));
    }
}
