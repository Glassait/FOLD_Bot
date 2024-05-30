import { type Client, Events } from 'discord.js';
import { basename } from 'node:path';
import { EmojiEnum } from '../../shared/enums/emoji.enum';
import { TriviaSingleton } from '../../shared/singleton/trivia/trivia.singleton';
import { FeatureFlippingTable } from '../../shared/tables/complexe-table/feature-flipping/feature-flipping.table';
import { asyncThread, thread } from '../../shared/utils/env.util';
import { Logger } from '../../shared/utils/logger';
import { getRandomStatus } from '../../shared/utils/sentence.util';
import { TriviaMonthModel } from './models/trivia-month.model';
import type { BotEvent } from './types/bot-event.type';

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

        if (today.getDate() !== 28) {
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
