/**
 * Way to refer to discord id
 */
export type DiscordId = string; // NOSONAR

/**
 * Type describing a Discord channel.
 */
export type Channel = {
    /**
     * The Discord ID of the guild to which the channel belongs.
     */
    guild: DiscordId;
    /**
     * The Discord ID of the channel
     */
    id: DiscordId;
};

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
 * Type defining the architecture for describing recruitment.
 */
export type FoldRecruitment = {
    /**
     * Array of schedules for recruitment.
     */
    schedule: string[];
    /**
     * The wot api url to get the clan image
     *
     * @replace APPLICATION_ID
     * @replace CLAN_NAME
     */
    image_url: string;
    /**
     * The wot api url to get the clan activity
     *
     * @replace CLAN_ID
     */
    newsfeed_url: string;
    /**
     * The wargaming url to display the main page of the clan
     *
     * @replace CLAN_ID
     */
    clan_url: string;
    /**
     * The tomato url to display the main statistics of the player
     *
     * @replace PLAYER_NAME
     * @replace PLAYER_ID
     */
    tomato_url: string;
    /**
     * The wargaming url to display the main statistics of the player
     *
     * @replace PLAYER_NAME
     * @replace PLAYER_ID
     */
    wargaming_url: string;
    /**
     * The wot life url to display the main statistics of the player
     *
     * @replace PLAYER_NAME
     * @replace PLAYER_ID
     */
    wot_life_url: string;
    /**
     * The wot url to search the id player of player with a name
     *
     * @replace APPLICATION_ID
     * @replace PLAYER_NAME
     */
    player_url: string;
    /**
     * The wot url to get the personal data of a player
     *
     * @replace APPLICATION_ID
     * @replace PLAYER_ID
     */
    player_personal_data: string;
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
    /**
     * The recruitment section of the inventory.
     */
    fold_recruitment: FoldRecruitment;
    /**
     * Channels configuration for various features.
     */
    channels: {
        /**
         * The channel configuration for the newsletter feature.
         */
        newsletter: Channel;
        /**
         * The channel configuration for the trivia feature.
         */
        trivia: Channel;
        /**
         * The channel configuration for the fold recruitment feature.
         */
        fold_recruitment: Channel;
        [key: string]: Channel;
    };
    /**
     * Object mapping command keys to Discord IDs.
     */
    commands: {
        [key: string]: DiscordId[];
    };
    /**
     * Feature flipping configuration to enable or disable specific features dynamically.
     *
     * @example
     * const inventory: InventoryType = {
     *   // ... other fields ...
     *   feature_flipping: {
     *     feature1: true,
     *     feature2: false,
     *     // ...
     *   },
     * };
     */
    feature_flipping: {
        [key: string]: boolean;
    };
};
