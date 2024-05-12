/**
 * Type defining the structure of a website state, used in the newsletter type.
 */
export type NewsWebsite = {
    /**
     * The live URL of the website.
     */
    live_url: string;
    /**
     * The last URL of the website.
     */
    last_url: string;
    /**
     * The name of the website.
     */
    name: string;
    /**
     * The selector associated with the website.
     */
    selector: string;
};
