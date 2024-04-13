import { Client } from 'discord.js';
import { join } from 'path';
import { readdirSync } from 'fs';
import { EmojiEnum } from '../../shared/enums/emoji.enum';
import { Logger } from '../../shared/classes/logger';
import { basename } from 'node:path';
import { BotLoop } from '../loops/types/bot-loop.type';
import { TimeEnum } from '../../shared/enums/time.enum';

module.exports = async (client: Client): Promise<void> => {
    const logger: Logger = new Logger(basename(__filename));
    const loopsDir: string = join(__dirname, '../loops');
    let numberOfLoops: number = 0;

    setTimeout((): void => {
        readdirSync(loopsDir).forEach((file: string): void => {
            if (!file.endsWith('.ts')) return;

            const loop: BotLoop = require(`${loopsDir}/${file}`);
            loop.execute(client);

            ++numberOfLoops;
            logger.info(`${EmojiEnum.LOOP} Successfully loaded loop {} !`, loop.name);
        });
        logger.debug(`Loaded ${numberOfLoops} loop`);
    }, TimeEnum.SECONDE);
};
