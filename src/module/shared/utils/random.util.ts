export class RandomUtil {
    /**
     * Calculate a random number between {@link min} and {@link max}
     * @param [max=1] The max number of the randomness, include
     * @param [min=0] The min number of the randomness, include
     * @return Return a random number between {@link min} and {@link max}
     */
    public static getRandomNumber(max: number = 1, min: number = 0): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    /**
     * Create an array of number fill with random number between {@link max} and {@link min}
     * @param [length=1] The length of the array
     * @param [max=1] The max for the random number, include
     * @param [min=0] The min for the ransom number, include
     * @param [allowRepeat] If the array can contains same value multiple times
     * @param [forbidden] The forbidden number to not add in the array
     * @return The array fill with random number
     */
    public static getArrayWithRandomNumber(
        length: number = 1,
        max: number = 1,
        min: number = 0,
        allowRepeat?: boolean,
        forbidden?: number[]
    ): number[] {
        return new Array(length).fill(undefined).reduce((previousValue: number[], _currentValue: any): number[] => {
            let randomNumber: number = this.getRandomNumber(max, min);
            while ((!allowRepeat && previousValue.includes(randomNumber)) || forbidden?.includes(randomNumber)) {
                randomNumber = this.getRandomNumber(max, min);
            }
            previousValue.push(randomNumber);
            return previousValue;
        }, []);
    }
}
