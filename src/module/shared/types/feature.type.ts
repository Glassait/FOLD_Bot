export type DiscordId = string; // NOSONAR

export type Reply = { activateFor: DiscordId; replyTo: DiscordId };

export type FeatureType = {
    version: number;
    auto_disconnect: DiscordId;
    auto_reply: Reply[];
};
