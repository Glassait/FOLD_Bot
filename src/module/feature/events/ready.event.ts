import { type Client, Events, TextChannel } from 'discord.js';
import { basename } from 'node:path';
import { EmojiEnum } from '../../shared/enums/emoji.enum';
import { TriviaSingleton } from '../../shared/singleton/trivia/trivia.singleton';
import { FeatureFlippingTable } from '../../shared/tables/complexe-table/feature-flipping/feature-flipping.table';
import { asyncThread, isDev, thread } from '../../shared/utils/env.util';
import { Logger } from '../../shared/utils/logger';
import { getRandomStatus } from '../../shared/utils/sentence.util';
import { TriviaMonthModel } from './models/trivia-month.model';
import type { BotEvent } from './types/bot-event.type';
import { fetchChannelFromClient } from '../../shared/utils/user.util';
import { WotNewsForumModel } from './models/wot-news-forum.model';

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client): Promise<void> {
        const logger: Logger = new Logger(basename(__filename));
        const featuresTable: FeatureFlippingTable = new FeatureFlippingTable();
        logger.info(`${EmojiEnum.MUSCLE} Logged in as {}`, client.user!.tag);

        const [activityType, sentence] = getRandomStatus();
        logger.debug('Status of the bot set to {} and {}', activityType, sentence);

        client.user?.setPresence({ activities: [{ type: activityType, name: sentence }], status: 'online' });

        const today: Date = new Date();

        if (!isDev()) {
            const channel: TextChannel = await fetchChannelFromClient(client, {
                channel_id: '1185175797628149790',
                guild_id: '1184852469164027976',
            });

            const messages = await channel.messages.fetch({ limit: 20 });

            const wotNews = new WotNewsForumModel(client);
            await wotNews.initialize(client);

            for (const [, message] of messages) {
                await wotNews.crosspostMessage(message);
            }
        }

        if (today.getDate() !== 1) {
            return;
        }

        if (await featuresTable.getFeature('trivia_month')) {
            thread(async (): Promise<void> => {
                const triviaMonth: TriviaMonthModel = new TriviaMonthModel();
                await triviaMonth.initialise(client);
                await triviaMonth.createEmbedAndSendToChannel();
            });
        }

        const trivia: TriviaSingleton = TriviaSingleton.instance;
        asyncThread(trivia.updateTanksTableFromWotApi.bind(trivia));
    },
} as BotEvent;
