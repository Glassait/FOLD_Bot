import { Client } from 'discord.js';
import { Logger } from '../../shared/classes/logger';
import { Context } from '../../shared/classes/context';
import { EnvUtil } from '../../shared/utils/env.util';
import { TriviaGameModel } from './model/trivia-game.model';

module.exports = async (client: Client): Promise<void> => {
    const logger: Logger = new Logger(new Context('TRIVIA-LOOP'));
    const triviaGame: TriviaGameModel = new TriviaGameModel();
    await triviaGame.fetchMandatory(client);

    logger.info('🔁 Trivia game initialized');

    const startDate: Date = new Date();
    const targetDate: Date = new Date();
    targetDate.setHours(16, 30, 0, 0);

    let time = targetDate.getTime() - startDate.getTime();
    await EnvUtil.sleep(time > 0 ? time : 0);

    let index: number = 0;
    while (index !== -1) {
        targetDate.setHours(targetDate.getHours() + 2, 0, 0, 0);
        time = targetDate.getTime() - startDate.getTime();
        // await EnvUtil.sleep(time);

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
