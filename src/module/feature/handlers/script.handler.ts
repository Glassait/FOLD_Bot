import { type Client } from 'discord.js';
import { readdirSync } from 'fs';
import { basename } from 'node:path';
import { join } from 'path';
import { EmojiEnum } from '../../shared/enums/emoji.enum';
import { Logger } from '../../shared/utils/logger';
import type { ScriptModel } from '../scripts/models/script.model';

module.exports = async (client: Client): Promise<void> => {
    const logger: Logger = new Logger(basename(__filename));
    const scriptsDir: string = join(__dirname, '../scripts');

    for (const file of readdirSync(scriptsDir)) {
        if (file.endsWith('.ts')) {
            const script: ScriptModel = require(`${scriptsDir}/${file}`);
            await script.script(client);
            logger.info(`${EmojiEnum.FLAME} Successfully launch script : {}`, script.name);
        }
    }
};
