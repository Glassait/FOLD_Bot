import { Client } from 'discord.js';
import { Logger } from '../../shared/classes/logger';
import { Context } from '../../shared/classes/context';
import { EnvUtil } from '../../shared/utils/env.util';
import { TriviaGameModel } from './model/trivia-game.model';
import { InventorySingleton } from '../../shared/singleton/inventory.singleton';

module.exports = async (client: Client): Promise<void> => {
    const logger: Logger = new Logger(new Context('TRIVIA-LOOP'));
    const triviaGame: TriviaGameModel = new TriviaGameModel();
    const inventory: InventorySingleton = InventorySingleton.instance;
    await triviaGame.fetchMandatory(client);

    logger.info('🔁 Trivia game initialized');
    for (const hour of inventory.triviaSchedule) {
        logger.debug('🔁 Trivia loop start');
        const startDate = new Date();
        const targetDate = new Date();
        targetDate.setHours(hour, 30, 0, 0);
        logger.info(`🎮 Trivia loop start at ${targetDate}`);
        const time = targetDate.getTime() - startDate.getTime();

        if (time > 0) {
            await EnvUtil.sleep(time);

            logger.info('🎮 Trivia game start');
            try {
                await triviaGame.fetchTanks();
            } catch (e) {
                logger.error(`Error during trivia loop : ${e}`);
            }

            await triviaGame.sendMessageToChannel();
            await triviaGame.collectAnswer();

            await EnvUtil.sleep(triviaGame.MAX_TIME);
            logger.info('🎮 Trivia game end');
            await triviaGame.sendAnswerToChannel();
        }
    }
    logger.debug('🔁 Trivia loop end');
};
