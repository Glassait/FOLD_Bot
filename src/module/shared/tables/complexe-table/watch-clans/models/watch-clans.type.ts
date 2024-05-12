/**
 * Represents information about a clan.
 *
 * @example
 * const myClan: Clan = { id: '123', name: 'My Clan', imageUrl: 'https://example.com/clan_image.jpg' };
 */
export type Clan = {
    /**
     * The unique ID of the clan
     */
    id: number;
    /**
     * The name of the clan.
     */
    name: string;
    /**
     * The optional URL of the clan's image.
     */
    image_url?: string;
    /**
     * The last time a leaving activity was detected
     */
    last_activity?: string;
};
