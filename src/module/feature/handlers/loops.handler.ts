import type { Client } from 'discord.js';
import { readdirSync } from 'fs';
import { basename } from 'node:path';
import { join } from 'path';
import { EmojiEnum } from '../../shared/enums/emoji.enum';
import { TimeEnum } from '../../shared/enums/time.enum';
import { Logger } from '../../shared/utils/logger';
import type { BotLoop } from '../loops/types/bot-loop.type';

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
