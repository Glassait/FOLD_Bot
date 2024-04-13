import { type Client, Events } from 'discord.js';
import { basename } from 'node:path';
import type { Logger } from '../../shared/classes/logger';
import { EmojiEnum } from '../../shared/enums/emoji.enum';
import { InventorySingleton } from '../../shared/singleton/inventory.singleton';
import { TriviaSingleton } from '../../shared/singleton/trivia.singleton';
import { SentenceUtil } from '../../shared/utils/sentence.util';
import type { SearchClanModel } from './models/search-clan.model';
import type { TriviaMonthModel } from './models/trivia-month.model';
import type { BotEvent } from './types/bot-event.type';

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client): Promise<void> {
        let imp = require('../../shared/classes/logger');
        const logger: Logger = new imp.Logger(basename(__filename));

        const inventory: InventorySingleton = InventorySingleton.instance;
        const trivia: TriviaSingleton = TriviaSingleton.instance;

        logger.info(`${EmojiEnum.MUSCLE} Logged in as {}`, client.user?.tag as string);

        const status = SentenceUtil.getRandomStatus();
        logger.debug(`Status of the bot set to {} and {}`, status[0], status[1]);

        client.user?.setPresence({
            activities: [
                {
                    type: status[0],
                    name: status[1],
                },
            ],
            status: 'online',
        });

        if (inventory.getFeatureFlipping('trivia')) {
            await trivia.fetchTankOfTheDay();
            await trivia.sendTriviaResultForYesterday(client);
            await trivia.reduceEloOfInactifPlayer();
        }

        const today: Date = new Date();

        if (today.getDate() !== 13) {
            return;
        }

        if (inventory.getFeatureFlipping('trivia_month')) {
            let req = require('./models/trivia-month.model');
            const triviaMonth: TriviaMonthModel = new req.TriviaMonthModel();

            await triviaMonth.initialise(client);
            await triviaMonth.createEmbedAndSendToChannel();
        }

        if (inventory.getFeatureFlipping('search_clan')) {
            let red = require('./models/search-clan.model');
            const searchClanModel: SearchClanModel = new red.SearchClanModel();

            await searchClanModel.searchClan();
        }
    },
} as BotEvent;
