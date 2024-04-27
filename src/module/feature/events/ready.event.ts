import { type Client, Events } from 'discord.js';
import { basename } from 'node:path';
import { EmojiEnum } from '../../shared/enums/emoji.enum';
import { TriviaSingleton } from '../../shared/singleton/trivia.singleton';
import { FeatureFlippingTable } from '../../shared/tables/feature-flipping.table';
import { Logger } from '../../shared/utils/logger';
import { SentenceUtil } from '../../shared/utils/sentence.util';
import type { SearchClanModel } from './models/search-clan.model';
import type { TriviaMonthModel } from './models/trivia-month.model';
import type { BotEvent } from './types/bot-event.type';

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client): Promise<void> {
        const logger: Logger = new Logger(basename(__filename));
        const features: FeatureFlippingTable = new FeatureFlippingTable();
        const trivia: TriviaSingleton = TriviaSingleton.instance;

        logger.info(`${EmojiEnum.MUSCLE} Logged in as {}`, client.user?.tag as string);

        const status = SentenceUtil.getRandomStatus();
        logger.debug('Status of the bot set to {} and {}', status[0], status[1]);

        client.user?.setPresence({
            activities: [
                {
                    type: status[0],
                    name: status[1],
                },
            ],
            status: 'online',
        });

        if (await features.getFeature('trivia')) {
            await trivia.fetchTankOfTheDay();
            await trivia.sendTriviaResultForYesterday(client);
            await trivia.reduceEloOfInactifPlayer();
        }

        const today: Date = new Date();

        if (today.getDate() !== 1) {
            return;
        }

        if (await features.getFeature('trivia_month')) {
            const req = require('./models/trivia-month.model');
            const triviaMonth: TriviaMonthModel = new req.TriviaMonthModel();

            await triviaMonth.initialise(client);
            await triviaMonth.createEmbedAndSendToChannel();
        }

        if (await features.getFeature('search_clan')) {
            const red = require('./models/search-clan.model');
            const searchClanModel: SearchClanModel = new red.SearchClanModel();

            await searchClanModel.searchClan();
        }
    },
} as BotEvent;
