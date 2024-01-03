import { Client } from 'discord.js';
import { Logger } from '../../shared/classes/logger';
import { Context } from '../../shared/classes/context';
import { EnvUtil } from '../../shared/utils/env.util';
import { TriviaGameModel } from './model/trivia-game.model';

module.exports = async (client: Client): Promise<void> => {
    const logger: Logger = new Logger(new Context('TRIVIA-LOOP'));
    const triviaGame: TriviaGameModel = new TriviaGameModel();
    await triviaGame.fetchMandatory(client);
    const getNextHour = (): number => {
        const now = new Date();
        for (const hour of [18, 20, 22, 0]) {
            if (hour > now.getHours() || (hour === now.getHours() && now.getMinutes() < 30)) {
                return hour;
            }
        }
        return 0;
    };

    logger.info('🔁 Trivia game initialized');

    const startDate: Date = new Date();
    const targetDate: Date = new Date();
    targetDate.setHours(16, 30, 0, 0);

    const time = targetDate.getTime() - startDate.getTime();
    await EnvUtil.sleep(time > 0 ? time : 0);

    let index: number = 0;
    while (index !== -1) {
        logger.debug('🔁 Trivia loop start');
        targetDate.setHours(getNextHour(), 30, 0, 0);
        await EnvUtil.sleep(targetDate.getTime() - startDate.getTime());

        logger.info('🎮 Trivia game start');
        try {
            await triviaGame.fetchTanks();
        } catch (e) {
            logger.error(`Error during trivia loop : ${e}`);
            index = -1;
        }

        await triviaGame.sendMessageToChannel();
        await triviaGame.collectAnswer();

        await EnvUtil.sleep(triviaGame.MAX_TIME);
        logger.info('🎮 Trivia game end');
        await triviaGame.sendAnswerToChannel();
    }
    logger.error('🔁 Trivia loop end');
};
