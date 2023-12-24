import { Client } from 'discord.js';
import { Logger } from '../../shared/classes/logger';
import { Context } from '../../shared/classes/context';
import { EnvUtil } from '../../shared/utils/env.util';
import { TriviaGameModel } from './model/trivia-game.model';
import { RandomUtil } from '../../shared/utils/random.util';

module.exports = async (client: Client): Promise<void> => {
    const logger: Logger = new Logger(new Context('TRIVIA-LOOP'));
    const triviaGame: TriviaGameModel = new TriviaGameModel();
    await triviaGame.fetchMandatory(client);

    logger.info('🔁 Trivia game initialized');
    let index: number = 0;
    while (index !== -1) {
        await EnvUtil.sleep(RandomUtil.getRandomNumber(1000 * 60 * 60 * 4, 1000 * 60 * 60));

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
