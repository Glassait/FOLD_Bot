import { TriviaSelected } from './trivia.type';

//region TRIVIA
/**
 * The list of daily tanks selected
 */
export type DailyTank = { [day: string]: TriviaSelected[] };

/**
 * Represents the overall statistics for a specific month in the trivia game.
 */
export type MonthlyTriviaOverallStatistic = {
    /**
     * The total number of games start by the bot, during the month
     */
    number_of_game: number;
    /**
     * The total number of day without participation, during the month
     */
    day_without_participation: number;
    /**
     * The list of daily selected tanks
     */
    day_tank: DailyTank;
};

/**
 * Represents the overall statistics for the trivia game, categorized by month.
 */
export type TriviaOverallStatisticType = {
    [month: string]: MonthlyTriviaOverallStatistic;
};

/**
 * The daily statistique of the player
 */
export type DailyTrivia = {
    /**
     * The participation of the player during the day
     */
    participation: number;
    /**
     * The total number of right answers during the day
     */
    right_answer: number;
    /**
     * All daily answer given by the player during the day
     */
    answer: string[];
    /**
     * The time taken by the player to answer the trivia question during the month
     */
    answer_time: number[];
    /**
     * The date when the player answered the trivia question
     */
    answer_date: Date[];
};

/**
 * Represents the win streak of a player.
 */
export type WinStreak = {
    /**
     * The current win streak count.
     */
    current: number;
    /**
     * The maximum win streak count achieved.
     */
    max: number;
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
     * The daily statistique of the player
     */
    daily: { [day: string]: DailyTrivia };
    /**
     * The winning streak of the player during the month
     */
    win_streak: WinStreak;
};

/**
 * Represents the player-specific statistics for the trivia game, categorized by player.
 */
export type TriviaPlayerStatisticType = {
    [month: string]: MonthlyTriviaPlayerStatisticType;
};

/**
 * Represents the overall statistics for the trivia game, including both overall and player-specific data.
 */
export type TriviaStatistic = {
    /**
     * The version number of the trivia statistics data.
     * @update It each time the architecture changes
     */
    version: number;
    overall: TriviaOverallStatisticType;
    player: {
        [player: string]: TriviaPlayerStatisticType;
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
    [month: string]: MonthlyFoldRecruitmentClanStatisticType;
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
        [clan: string]: FoldRecruitmentClanStatisticType;
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
    trivia: TriviaStatistic;
    /**
     * Statistics related to fold recruitment.
     */
    fold_recruitment: FoldRecruitmentStatisticType;
};
