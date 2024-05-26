//region NEWSFEED
/**
 * The common part of the activity type
 */
export type GlobalClanActivity = {
    group: 'military_personnel';
    initiator_id: null;
    created_at: string;
    accounts_ids: number[];
    accounts_info: {
        [account: string]: {
            url: string;
            role: string;
            name: string;
        };
    };
};

/**
 * The change role part of the activity type
 */
export type ChangeRoleClanActivity = {
    subtype: 'change_role';
    type: 'change_role';
    additional_info: {
        [key: string]: {
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
        }[];
    };
} & GlobalClanActivity;

/**
 * The join clan part of the activity type
 */
export type JoinClanActivity = {
    subtype: 'join_clan';
    type: 'join_clan';
    additional_info: {
        [key: string]: {
            transaction_id: number;
            joining_method: string;
        }[];
    };
} & GlobalClanActivity;

/**
 * The leave clan part of the activity type
 */
export type LeaveClanActivity = {
    subtype: 'leave_clan';
    type: 'leave_clan';
    additional_info: {
        [key: string]: {
            last_role_name: string;
            transaction_id: number;
        }[];
    };
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
