import { type Client, Events } from 'discord.js';
import { basename } from 'node:path';
import { EmojiEnum } from '../../shared/enums/emoji.enum';
import type { TriviaSingleton } from '../../shared/singleton/trivia/trivia.singleton';
import { FeatureFlippingTable } from '../../shared/tables/complexe-table/feature-flipping/feature-flipping.table';
import { EnvUtil } from '../../shared/utils/env.util';
import { Logger } from '../../shared/utils/logger';
import { SentenceUtil } from '../../shared/utils/sentence.util';
import type { TriviaMonthModel } from './models/trivia-month.model';
import type { BotEvent } from './types/bot-event.type';

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client): Promise<void> {
        const logger: Logger = new Logger(basename(__filename));
        const featuresTable: FeatureFlippingTable = new FeatureFlippingTable();
        logger.info(`${EmojiEnum.MUSCLE} Logged in as {}`, client.user?.tag as string);

        const status = SentenceUtil.getRandomStatus();
        logger.debug('Status of the bot set to {} and {}', status[0], status[1]);

        client.user?.setPresence({ activities: [{ type: status[0], name: status[1] }], status: 'online' });

        const today: Date = new Date();

        if (today.getDate() !== 1) {
            return;
        }

        if (await featuresTable.getFeature('trivia_month')) {
            EnvUtil.thread(async (): Promise<void> => {
                const req = require('./models/trivia-month.model');
                const triviaMonth: TriviaMonthModel = new req.TriviaMonthModel();

                await triviaMonth.initialise(client);
                await triviaMonth.createEmbedAndSendToChannel();
            });
        }

        const trivia: TriviaSingleton = require('../../shared/singleton/trivia/trivia.singleton').TriviaSingleton.instance;
        EnvUtil.asyncThread(trivia.updateTanksTableFromWotApi.bind(trivia));
    },
} as BotEvent;
