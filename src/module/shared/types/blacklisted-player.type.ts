/**
 * Represents a blacklisted player.
 *
 * @example {
 *      id: 1
 *      name: "KhaledTian",
 *      reason: "dolor potenti efficiantur vehicula quot"
 * }
 */
export type BlacklistedPlayer = {
    /**
     * The unique ID of the player
     */
    id: number;
    /**
     * The name of the blacklisted player.
     */
    name: string;
    /**
     * The reason for blacklisting the player.
     */
    reason: string;
};
