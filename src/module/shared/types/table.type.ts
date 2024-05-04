/**
 * * This file contain all types related to data fetch in table class
 */

import { Ammo } from './wot-api.type';

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

/**
 * Represent the information store in the tanks table
 */
export type Tank = {
    /**
     * The name of the tank
     */
    name: string;
    /**
     * The image url of the tank
     */
    image: string;
    /**
     * The shell definition of the tank
     */
    ammo: Ammo[];
};

/**
 * Represent the information store in the database about a trivia player
 */
export type TriviaPlayer = {
    /**
     * A generated id
     */
    id: number;
    /**
     * The name od the player
     */
    name: string;
};

/**
 * Represent the information store in the database about the trivia answer
 */
export type TriviaAnswer = {
    /**
     * Generated id
     */
    id: number;
    /**
     * The player id to link with the player table
     */
    player_id: number;
    /**
     * The Trivia id to link with the trivia table
     */
    trivia_id: number;
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
    answer_time: number;
    /**
     * The elo at the end of the trivia
     */
    elo: number;
};
