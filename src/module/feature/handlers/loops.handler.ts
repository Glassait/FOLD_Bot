import type { Client } from 'discord.js';
import { readdirSync } from 'fs';
import { basename } from 'node:path';
import { join } from 'path';
import { EmojiEnum } from '../../shared/enums/emoji.enum';
import { TimeEnum } from '../../shared/enums/time.enum';
import { Logger } from '../../shared/utils/logger';
import type { BotLoop } from '../loops/types/bot-loop.type';
import { EnvUtil } from '../../shared/utils/env.util';

module.exports = (client: Client): void => {
    const logger: Logger = new Logger(basename(__filename));
    const loopsDir: string = join(__dirname, '../loops');
    let numberOfLoops: number = 0;

    setTimeout((): void => {
        readdirSync(loopsDir).forEach((file: string): void => {
            if (!file.endsWith('.ts')) return;

            const loop: BotLoop = require(`${loopsDir}/${file}`) as BotLoop;
            EnvUtil.asyncThread(async (): Promise<void> => {
                await loop.execute(client);
            });

            ++numberOfLoops;
            logger.info(`${EmojiEnum.LOOP} Successfully loaded loop {} !`, loop.name);
        });
        logger.debug(`Loaded ${numberOfLoops} loop`);
    }, TimeEnum.SECONDE);
};
