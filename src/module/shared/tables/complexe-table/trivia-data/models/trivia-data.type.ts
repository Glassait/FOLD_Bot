/**
 * Type defining the structure for the trivia game.
 */
export type TriviaData = {
    /**
     * The URL associated with the trivia game.
     */
    url: string;
    /**
     * Array of last tank pages for the trivia game.
     */
    last_tank_page: number[];
    /**
     * The maximum number of tank pages that can be store in the {@link last_tank_page} array.
     *
     * When the {@link last_tank_page} array length is higher than the number, the 4 first tanks pages can be re-used.
     */
    max_number_of_unique_tanks: number;
    /**
     * The maximum number of questions the player can ask.
     */
    max_number_of_question: number;
    /**
     * The maximum duration for a trivia question (in minutes).
     */
    max_duration_of_question: number;
    /**
     * The maximum duration for a trivia question (in minutes).
     */
    max_response_time_limit: number;
};
