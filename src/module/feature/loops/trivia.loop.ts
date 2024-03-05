import { Client } from 'discord.js';
import { Logger } from '../../shared/classes/logger';
import { Context } from '../../shared/classes/context';
import { EnvUtil } from '../../shared/utils/env.util';
import { TriviaGameModel } from './model/trivia-game.model';
import { InventorySingleton } from '../../shared/singleton/inventory.singleton';
import { TimeUtil } from '../../shared/utils/time.util';
import { EmojiEnum } from '../../shared/enums/emoji.enum';

module.exports = async (client: Client): Promise<void> => {
    const logger: Logger = new Logger(new Context('TRIVIA-LOOP'));
    const triviaGame: TriviaGameModel = new TriviaGameModel();
    const inventory: InventorySingleton = InventorySingleton.instance;

    if (!inventory.getFeatureFlipping('trivia')) {
        logger.warn("Trivia game disabled, if it's normal, dont mind this message !");
        return;
    }

    await triviaGame.fetchMandatory(client);

    logger.info(`${EmojiEnum.LOOP} Trivia game initialized`);
    await TimeUtil.forLoopTimeSleep(inventory.triviaSchedule, '🎮 Trivia', async (): Promise<void> => {
        logger.debug(`${EmojiEnum.GAME} Trivia game start`);
        await triviaGame.fetchTanks();

        await triviaGame.sendMessageToChannel();
        await triviaGame.collectAnswer();

        await EnvUtil.sleep(triviaGame.MAX_TIME);
        logger.debug(`${EmojiEnum.GAME} Trivia game end`);
        await triviaGame.sendAnswerToChannel();
    });
    logger.info(`${EmojiEnum.LOOP} Trivia loop end`);
};
