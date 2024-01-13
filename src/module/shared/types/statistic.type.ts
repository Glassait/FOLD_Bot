/**
 * The monthly overall statistic for the trivia game
 */
export type MonthlyTriviaOverallStatisticType = {
    number_of_game: number;
    game_without_participation: number;
};

/**
 * Definition of the architecture of the overall statistic for the trivia game
 */
export type TriviaOverallStatisticType = {
    [key: string]: MonthlyTriviaOverallStatisticType;
};

/**
 * The monthly statistic of the player for the trivia game
 */
export type MonthlyTriviaPlayerStatisticType = {
    elo: number;
    participation: number;
    right_answer: number;
    answer_time: number[];
    win_strick: { current: number; max: number };
};

/**
 * Definition of the architecture of the player statistic for the trivia game
 */
export type TriviaPlayerStatisticType = {
    [key: string]: MonthlyTriviaPlayerStatisticType;
};

/**
 * Definition of all the statistics for the trivia game
 * Update the version when updating the architecture/type
 */
export type TriviaStatisticType = {
    version: number;
    overall: TriviaOverallStatisticType;
    player: {
        [key: string]: TriviaPlayerStatisticType;
    };
};

/**
 * Definition of the architecture of the statistic.json file.
 * Update the version when updating the architecture/type
 */
export type StatisticType = {
    version: number;
    trivia: TriviaStatisticType;
};
