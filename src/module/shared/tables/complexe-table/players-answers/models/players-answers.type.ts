/**
 * Represent the information store in the database about the trivia answer
 */
export type TriviaAnswer = {
    /**
     * The generated id of the answer
     */
    id: number;
    /**
     * The player id to link with the player table
     */
    player_id: number;
    /**
     * The Trivia id to link with the trivia table
     */
    trivia_id: number | null;
    /**
     * The date of the answer
     */
    date: Date;
    /**
     * If the answer is a right answer
     */
    right_answer: boolean;
    /**
     * The time taken by the player to answer the question
     */
    answer_time: number | null;
    /**
     * The elo at the end of the trivia
     */
    elo: number;
};
