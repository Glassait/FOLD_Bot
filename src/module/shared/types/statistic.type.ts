//region TRIVIA
/**
 * Represents the overall statistics for a specific month in the trivia game.
 */
export type MonthlyTriviaOverallStatisticType = {
    /**
     * The total number of games start by the bot, during the month
     */
    number_of_game: number;
    /**
     * The total number of games without participation, during the month
     */
    game_without_participation: number;
    /**
     * The list of unique tanks selected, during the month
     */
    unique_tanks?: string[];
};

/**
 * Represents the overall statistics for the trivia game, categorized by month.
 */
export type TriviaOverallStatisticType = {
    [key: string]: MonthlyTriviaOverallStatisticType;
};

/**
 * Represents the player-specific statistics for a specific month in the trivia game.
 */
export type MonthlyTriviaPlayerStatisticType = {
    /**
     * The elo of the player during the month
     */
    elo: number;
    /**
     * The participation of the player during the month
     */
    participation: number;
    /**
     * The total number of right answer given by the player during the month
     */
    right_answer: number;
    /**
     * The time taken by the player to answer the trivia question during the month
     */
    answer_time: number[];
    /**
     * The winning streak of the player during the month
     */
    win_strick: { current: number; max: number };
};

/**
 * Represents the player-specific statistics for the trivia game, categorized by player.
 */
export type TriviaPlayerStatisticType = {
    [key: string]: MonthlyTriviaPlayerStatisticType;
};

/**
 * Represents the overall statistics for the trivia game, including both overall and player-specific data.
 */
export type TriviaStatisticType = {
    /**
     * The version number of the trivia statistics data.
     * @update It each time the architecture changes
     */
    version: number;
    overall: TriviaOverallStatisticType;
    player: {
        [key: string]: TriviaPlayerStatisticType;
    };
};
//endregion

//region FOLD RECRUITMENT
/**
 * Represents the monthly statistics for fold recruitment in a specific clan.
 */
export type MonthlyFoldRecruitmentClanStatisticType = {
    leaving_player: number;
};

/**
 * Represents the fold recruitment statistics for multiple months, categorized by month.
 */
export type FoldRecruitmentClanStatisticType = {
    [key: string]: MonthlyFoldRecruitmentClanStatisticType;
};

/**
 * Represents the overall fold recruitment statistics, including both version information and clan-specific data.
 */
export type FoldRecruitmentStatisticType = {
    /**
     * The version number of the fold recruitment statistics data.
     * @update It each time the architecture changes
     */
    version: number;
    /**
     * Clan-specific fold recruitment statistics, categorized by clan id.
     */
    clan: {
        [key: string]: FoldRecruitmentClanStatisticType;
    };
};
//endregion

/**
 * Represents the structure of a JSON file containing statistics data.
 */
export type StatisticType = {
    /**
     * The version number of the statistics data.
     * @update It each time the architecture changes
     */
    version: number;
    /**
     * Trivia-related statistics, including overall and player-specific data.
     */
    trivia: TriviaStatisticType;
    /**
     * Statistics related to fold recruitment.
     */
    fold_recruitment: FoldRecruitmentStatisticType;
};
