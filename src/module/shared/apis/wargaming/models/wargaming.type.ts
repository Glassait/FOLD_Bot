/**
 * Represent all the type of battles where player statistics are available
 * - random = battailes aléatoires
 * - fort_battles = incursions
 * - fort_sorties = escarmouches
 */
export type WargamingBattleType = 'random' | 'fort_battles' | 'fort_sorties' | 'global_map';

/**
 * Represent all the time frame where player statistics are available
 */
export type WargamingTimeframe = 28 | 'all';

//region NEWSFEED
/**
 * The common part of the activity type
 */
export type GlobalClanActivity = {
    group: 'military_personnel';
    initiator_id: null;
    created_at: string;
    accounts_ids: number[];
    accounts_info: Record<
        string,
        {
            url: string;
            role: string;
            name: string;
        }
    >;
};

/**
 * The change role part of the activity type
 */
export type ChangeRoleClanActivity = {
    subtype: 'change_role';
    type: 'change_role';
    additional_info: Record<
        string,
        {
            old_role: {
                rank: number;
                name: string;
                localized: string;
            };
            new_role: {
                rank: number;
                name: string;
                localized: string;
            };
        }[]
    >;
} & GlobalClanActivity;

/**
 * The join clan part of the activity type
 */
export type JoinClanActivity = {
    subtype: 'join_clan';
    type: 'join_clan';
    additional_info: Record<
        string,
        {
            transaction_id: number;
            joining_method: string;
        }[]
    >;
} & GlobalClanActivity;

/**
 * The leave clan part of the activity type
 */
export type LeaveClanActivity = {
    subtype: 'leave_clan';
    type: 'leave_clan';
    additional_info: Record<
        string,
        {
            last_role_name: string;
            transaction_id: number;
        }[]
    >;
} & GlobalClanActivity;

/**
 * The player definition
 */
export type Players = {
    name: string;
    id: number;
};

/**
 * The definition of the clan activity type
 */
export type ClanActivity = JoinClanActivity | LeaveClanActivity | ChangeRoleClanActivity;

/**
 * Architecture of the type for the clan event api
 */
export type WargamingNewsfeed = {
    _meta_: {
        until_date: string;
        collection: 'items';
    };
    items: ClanActivity[];
};
//endregion

//region ACCOUNTS
/**
 * Represents a Wargaming account with various statistical fields and clan information.
 */
export type WargamingAccount = {
    /**
     * Information about the player's clan.
     */
    clan: {
        /**
         * The tag of the clan, if available.
         */
        tag?: string;
    };
    /**
     * Statistical fields related to the player's account.
     */
    table_fields: {
        /**
         * Indicates if the table fields are available.
         */
        available: boolean;
        /**
         * The ground damage value, or null if not available.
         */
        ground_damage: number | null;
        /**
         * The time of the last battle, currently always null.
         */
        last_battle_time: null;
        /**
         * The average number of battles per day, or null if not available.
         */
        battles_per_day: number | null;
        /**
         * The personal rating of the player, or null if not available.
         */
        personal_rating: number | null;
        /**
         * The average experience per battle, or null if not available.
         */
        exp_per_battle: number | null;
        /**
         * The average damage per battle, or null if not available.
         */
        damage_per_battle: number | null;
        /**
         * The total number of wins, or null if not available.
         */
        wins_count: number | null;
        /**
         * The average frags (kills) per battle, or null if not available.
         */
        frags_per_battle: number | null;
        /**
         * The total damage, or null if not available.
         */
        damage: number | null;
        /**
         * The total experience, or null if not available.
         */
        experience: number | null;
        /**
         * The win percentage, or null if not available.
         */
        wins_percentage: number | null;
        /**
         * The total number of battles, or null if not available.
         */
        battles_count: number | null;
        /**
         * The reason the account is blocked, or null if not available.
         */
        blocked_reason: string | null;
    };
    /**
     * The role of the player in the clan, or null if not available.
     */
    role: string | null;
    /**
     * The unique identifier of the account.
     */
    id: number;
    /**
     * The name of the player.
     */
    name: string;
};

/**
 * Represents a collection of Wargaming accounts along with metadata.
 */
export type WargamingAccounts = {
    /**
     * Metadata about the accounts collection.
     */
    _meta_: {
        /**
         * The total number of accounts.
         */
        total: number;
        /**
         * The name of the collection.
         */
        collection: string;
    };
    /**
     * An array of Wargaming accounts.
     */
    accounts: WargamingAccount[];
};
//endregion

//region PLAYERS
/**
 * Represents a role in the Wargaming context.
 */
export type WargamingRole = {
    /**
     * The localized name of the role.
     */
    localized_name: string;
    /**
     * The name of the role.
     */
    name: string;
    /**
     * The rank of the role.
     */
    rank: number;
    /**
     * The order of the role.
     */
    order: number;
};

/**
 * Represents a player in the Wargaming context.
 */
export type WargamingPlayer = {
    /**
     * The number of days the player has been in the clan.
     */
    days_in_clan: number;
    /**
     * The timestamp of the player's last battle.
     */
    last_battle_time: number;
    /**
     * The average number of battles per day the player participates in.
     */
    battles_per_day: number;
    /**
     * The personal rating of the player.
     */
    personal_rating: number;
    /**
     * The average experience points per battle.
     */
    exp_per_battle: number;
    /**
     * The average damage per battle.
     */
    damage_per_battle: number;
    /**
     * The online status of the player.
     * Can be true (online), false (offline), or null (unknown).
     */
    online_status: boolean | null;
    /**
     * The average number of frags per battle.
     */
    frags_per_battle: number;
    /**
     * Indicates if the player is press.
     */
    is_press: boolean;
    /**
     * The win percentage of the player.
     */
    wins_percentage: number;
    /**
     * The role of the player.
     */
    role: WargamingRole;
    /**
     * Indicates if the player has abnormal results.
     */
    abnormal_results: boolean;
    /**
     * The total number of battles the player has participated in.
     */
    battles_count: number;
    /**
     * The unique identifier of the player.
     */
    id: number;
    /**
     * The profile link of the player.
     */
    profile_link: string;
    /**
     * The name of the player.
     */
    name: string;
};

/**
 * Represents a collection of players in the Wargaming context.
 */
export type WargamingPlayers = {
    /**
     * The status of the response.
     * Typically 'ok' if the request was successful.
     */
    status: string;
    /**
     * The list of players.
     */
    items: WargamingPlayer[];
    /**
     * Indicates if the player's statistics are hidden.
     */
    is_hidden_statistics: boolean;
    /**
     * The clan statistics.
     * Currently represented as an empty object, can be extended in the future.
     */
    clan_statistics: unknown;
    /**
     * The timestamp of the last update.
     */
    last_updated_at: string;
};
//endregion

//region CLAN INFO
/**
 * Represents a profile within the Wargaming API response.
 */
export type WargamingProfiles = {
    /**
     * The number of battles played by the account.
     */
    account_battles_count?: number;
    /**
     * Unknown data type (refer to Wargaming API documentation).
     */
    account_join_purposes?: unknown;
    /**
     * Unknown data type (refer to Wargaming API documentation).
     */
    account_join_purposes_localized?: unknown;
    /**
     * The win rate of the account.
     */
    account_win_rate?: number;
    /**
     * The average number of days per week the account plays.
     */
    days_per_week?: number;
    /**
     * A list of languages spoken by the account.
     */
    languages_list?: string[];
    /**
     * The number of members in the profile (clan or account).
     */
    members_count?: number;
    /**
     * The starting time of the prime time for the profile (in hours).
     */
    prime_time_from?: number;
    /**
     * The ending time of the prime time for the profile (in hours).
     */
    prime_time_to?: number;
    /**
     * The stronghold level of the profile (if applicable).
     */
    stronghold_level?: number;
    /**
     * The type of profile, either "account" or "clan".
     */
    type: 'account' | 'clan';
    /**
     * The win rate of the profile (may differ from account_win_rate).
     */
    win_rate?: number;
};

/**
 * Represents the clan view data within the Wargaming API response.
 */
export type WargamingClanView = {
    /**
     * Unknown data type (refer to Wargaming API documentation).
     */
    clan: unknown;
    /**
     * Unknown data type (refer to Wargaming API documentation).
     */
    currency: unknown;
    /**
     * An array of WargamingProfiles objects containing details about clan members or the account itself.
     */
    profiles: WargamingProfiles[];
    /**
     * Unknown data type (refer to Wargaming API documentation).
     */
    rating: unknown;
};

/**
 * Represents the complete clan information data within the Wargaming API response.
 */
export type WargamingClanInfo = {
    /**
     * The clan view data object containing details about the clan.
     */
    clanview: WargamingClanView;
};
//endregion
