import { type Client } from 'discord.js';
import { readdirSync } from 'fs';
import { basename } from 'node:path';
import { join } from 'path';
import { EmojiEnum } from '../../shared/enums/emoji.enum';
import { Logger } from '../../shared/utils/logger';
import type { ScriptModel } from '../scripts/models/script.model';
import { EnvUtil } from '../../shared/utils/env.util';

module.exports = (client: Client): void => {
    const logger: Logger = new Logger(basename(__filename));
    const scriptsDir: string = join(__dirname, '../scripts');

    for (const file of readdirSync(scriptsDir)) {
        if (!file.endsWith('.ts')) {
            continue;
        }

        const script: ScriptModel = require(`${scriptsDir}/${file}`) as ScriptModel;
        EnvUtil.asyncThread(async (): Promise<void> => {
            await script.script(client);
        });
        logger.info(`${EmojiEnum.FLAME} Successfully launch script : {}`, script.name);
    }
};
