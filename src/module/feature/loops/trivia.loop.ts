import { Client } from 'discord.js';
import { Logger } from '../../shared/classes/logger';
import { Context } from '../../shared/classes/context';
import { EnvUtil } from '../../shared/utils/env.util';
import { TriviaGameModel } from './model/trivia-game.model';
import { InventorySingleton } from '../../shared/singleton/inventory.singleton';
import { TimeUtil } from '../../shared/utils/time.util';

module.exports = async (client: Client): Promise<void> => {
    const logger: Logger = new Logger(new Context('TRIVIA-LOOP'));
    const triviaGame: TriviaGameModel = new TriviaGameModel();
    const inventory: InventorySingleton = InventorySingleton.instance;
    await triviaGame.fetchMandatory(client);

    logger.info('🔁 Trivia game initialized');
    await TimeUtil.forLoopTimeSleep(inventory.triviaSchedule, '🎮 Trivia', async (): Promise<void> => {
        logger.info('🎮 Trivia game start');
        await triviaGame.fetchTanks();

        await triviaGame.sendMessageToChannel();
        await triviaGame.collectAnswer();

        await EnvUtil.sleep(triviaGame.MAX_TIME);
        logger.info('🎮 Trivia game end');
        await triviaGame.sendAnswerToChannel();
    });
    logger.debug('🔁 Trivia loop end');
};
