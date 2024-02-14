import { Client, Events } from 'discord.js';
import { BotEvent } from './types/bot-event.type';
import { Context } from '../../shared/classes/context';
import { SentenceUtil } from '../../shared/utils/sentence.util';
import { Logger } from '../../shared/classes/logger';
import { TriviaMonthModel } from './models/trivia-month.model';
import { EmojiEnum } from '../../shared/enums/emoji.enum';

export const event: BotEvent = {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client): Promise<void> {
        const logger: Logger = new Logger(new Context('READY-EVENT'));

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

        const today = new Date();
        if (today.getDate() === 1) {
            const triviaMonth = new TriviaMonthModel();

            await triviaMonth.fetchMandatory(client, today);

            triviaMonth.embedIntroduction();
            triviaMonth.embedScoreboard();
            triviaMonth.embedQuickPlayer();
            triviaMonth.embedSlowPlayer();
            triviaMonth.embedWinStrickPlayer();
            triviaMonth.embedOverall();
            triviaMonth.embedFeedBack();

            await triviaMonth.sendToChannel();
        }
    },
};
