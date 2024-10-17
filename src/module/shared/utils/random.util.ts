/**
 * Calculate a random number between {@link min} and {@link max}
 *
 * @param {number} [max=1] - The max number (inclusive), include
 * @param {number} [min=0] - The min number (inclusive), include
 *
 * @return {number} - A random number between {@link min} and {@link max}
 */
export function getRandomNumber(max: number = 1, min: number = 0): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
}