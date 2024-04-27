/**
 * Type defining the structure for the trivia game.
 */
export type Trivia = {
    /**
     * The URL associated with the trivia game.
     */
    url: string;
    /**
     * The total number of tanks, used when fetching the tanks from the wot api.
     *
     * @example
     * {
     *    "game": {
     *        "trivia": {
     *            "total_number_of_tanks": 88,
     *        }
     *    }
     * }
     */
    total_number_of_tanks: number;
    /**
     * Array of last tank pages for the trivia game.
     *
     * @example
     * {
     *    "game": {
     *        "trivia": {
     *            "last_tank_page": [1, 2, 3, 4],
     *        }
     *    }
     * }
     */
    last_tank_page: number[];
    /**
     * The maximum number of tank pages that can be store in the {@link last_tank_page} array.
     *
     *  When the {@link last_tank_page} array length is higher than the number, the 4 first tanks pages can be re-used.
     *
     * @example
     * {
     *    "game": {
     *        "trivia": {
     *            "max_number_of_unique_tanks": 15,
     *        }
     *    }
     * }
     */
    max_number_of_unique_tanks: number;
    /**
     * The maximum number of questions the player can ask.
     *
     * @default 4 per day
     *
     * @example
     * {
     *    "game": {
     *        "trivia": {
     *            "max_number_of_question": 4,
     *        }
     *    }
     * }
     */
    max_number_of_question: number;
    /**
     * The maximum duration for a trivia question (in minutes).
     *
     * @default 2
     *
     * @example
     * {
     *    "game": {
     *        "trivia": {
     *            "max_duration_of_question": 2,
     *        }
     *    }
     * }
     */
    max_duration_of_question: number;
    /**
     * The maximum duration for a trivia question (in minutes).
     *
     * @default 15
     *
     * @example
     * {
     *    "game": {
     *        "trivia": {
     *            "max_response_time_limit": 15,
     *        }
     *    }
     * }
     */
    max_response_time_limit: number;
};

/**
 * Type defining the structure of the inventory.json file.
 */
export type InventoryType = {
    /**
     * The game section of the inventory.
     */
    game: {
        /**
         * The trivia type within the game section.
         */
        trivia: Trivia;
    };
};
