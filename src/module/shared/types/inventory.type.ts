import { DiscordId } from './feature.type';

/**
 * The architecture to describe channel
 */
export type Channel = { guild: DiscordId; id: DiscordId };

/**
 * Defined the website type, used in the newsletter type
 */
export type WebSiteState = { liveUrl: string; lastUrl: string; name: string; selector: string };

/**
 * Defined the newsletter architecture
 */
export type NewsLetter = { channel: Channel; website: WebSiteState[] };

/**
 * Defined the type for the trivia game
 */
export type TriviaType = { channel: Channel; url: string; limit: number; schedule: number[]; last_tank_page: number[] };

/**
 * The architecture to describe the recruitment
 */
export type Fold_recruitment = {
    feature: {
        header_clan: boolean;
        footer_message: boolean;
    };
    channel: Channel;
    [key: string]: string | any;
};

/**
 * Defined the inventory.json file architecture
 */
export type InventoryType = {
    newsLetter: NewsLetter;
    game: { trivia: TriviaType };
    fold_recruitment: Fold_recruitment;
    commands: {
        [key: string]: DiscordId[];
    };
};
