export class RandomUtil {
    /**
     * Calculate a random number between {@link min} and {@link max}
     *
     * @param {number} [max=1] - The max number (inclusive), include
     * @param {number} [min=0] - The min number (inclusive), include
     *
     * @return {number} - A random number between {@link min} and {@link max}
     */
    public static getRandomNumber(max: number = 1, min: number = 0): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    /**
     * Create an array of number fill with random number between {@link max} and {@link min}
     *
     * @param {boolean} [allowRepeat] - Whether repetition of numbers is allowed in the array.
     * @param {number[]} [forbidden] - An array of numbers that are forbidden to be generated.
     * @param {number} [length=1] - The length of the array to generate.
     * @param {number} [max=1] - The maximum value (inclusive) of the random numbers.
     * @param {number} [min=0] - The minimum value (inclusive) of the random numbers.
     *
     * @throws {Error} - Will throw an error if the length is less than 1 or if max is less than min.
     *
     * @return {number[]} - An array of random integers within the specified range.
     */
    public static getArrayWithRandomNumber(
        allowRepeat?: boolean,
        forbidden?: number[],
        length: number = 1,
        max: number = 1,
        min: number = 0
    ): number[] {
        if (!Number.isInteger(length) || length < 1) {
            throw new Error('Length must be a positive integer greater than 0.');
        }

        if (!Number.isInteger(max) || !Number.isInteger(min) || max < min) {
            throw new Error('Max and min must be integers, and max must be greater than min.');
        }

        const range: number = max - min + 1;
        const uniqueNumbers: Set<number> = new Set<number>(forbidden);
        const result: number[] = [];

        if (!allowRepeat && range < length) {
            throw new Error('Cannot generate unique numbers within the specified range.');
        }

        while (result.length < length) {
            const randomNumber: number = this.getRandomNumber(max, min);

            if (allowRepeat ?? !uniqueNumbers.has(randomNumber)) {
                result.push(randomNumber);
                uniqueNumbers.add(randomNumber);
            }
        }

        return result;
    }
}
