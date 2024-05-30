import { type Client, Events } from 'discord.js';
import { basename } from 'node:path';
import { Logger } from '../../shared/utils/logger';
import type { BotEvent } from './types/bot-event.type';

const logger: Logger = new Logger(basename(__filename));

module.exports = {
    name: Events.ShardError,
    execute(_client: Client, error: Error): void {
        logger.error(error.name, error);
    },
} as BotEvent;
