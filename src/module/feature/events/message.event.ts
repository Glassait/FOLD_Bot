import { type Client, Events, Message } from 'discord.js';
import type { BotEvent } from './types/bot-event.type';
import { WotNewsForumModel } from './models/wot-news-forum.model';

module.exports = {
    name: Events.MessageCreate,
    async execute(client: Client, interaction: Message): Promise<void> {
        const wotNewsForumModel: WotNewsForumModel = new WotNewsForumModel(client);

        if (
            wotNewsForumModel.guildId.includes(interaction.guildId!) &&
            wotNewsForumModel.channelId.includes(interaction.channelId) &&
            wotNewsForumModel.authorId.includes(interaction.author.id)
        ) {
            await wotNewsForumModel.initialize(client);
            await wotNewsForumModel.crosspostMessage(interaction);
        }
    },
} as BotEvent;
