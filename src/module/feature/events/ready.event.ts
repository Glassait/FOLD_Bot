import { Client, Events } from 'discord.js';
import { BotEvent } from './types/bot-event.type';
import { Context } from '../../shared/classes/context';
import { SentenceUtil } from '../../shared/utils/sentence.util';
import { Logger } from '../../shared/classes/logger';
import { EmojiEnum } from '../../shared/enums/emoji.enum';
import { TriviaMonthModel } from './models/trivia-month.model';
import { FoldMonthModel } from './models/fold-month.model';
import { InventorySingleton } from '../../shared/singleton/inventory.singleton';
import { TriviaSingleton } from '../../shared/singleton/trivia.singleton';

export const event: BotEvent = {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client): Promise<void> {
        const logger: Logger = new Logger(new Context('READY-EVENT'));
        const inventory: InventorySingleton = InventorySingleton.instance;
        const trivia = TriviaSingleton.instance;

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
            trivia.reduceEloOfInactifPlayer();
        }

        const today = new Date();

        if (today.getDate() !== 1) {
            return;
        }

        if (inventory.getFeatureFlipping('fold_month')) {
            const foldMonth = new FoldMonthModel();

            await foldMonth.fetchChannel(client);
            await foldMonth.sendMessage();
        }

        if (inventory.getFeatureFlipping('trivia_month')) {
            const triviaMonth = new TriviaMonthModel();

            await triviaMonth.fetchMandatory(client);
            triviaMonth.createEmbed();
            await triviaMonth.sendToChannel();
        }
    },
};
