/**
 * The common part of the activity type
 */
export type GlobalClanActivity = {
    group: 'military_personnel';
    initiator_id: null;
    created_at: string;
    accounts_ids: number[];
    accounts_info: {
        [key: string]: {
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
export type FoldRecruitmentData = {
    _meta_: {
        until_date: string;
        collection: 'items';
    };
    items: ClanActivity[];
};
