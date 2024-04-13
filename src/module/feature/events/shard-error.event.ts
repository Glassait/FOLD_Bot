import { type Client, Events } from 'discord.js';
import { basename } from 'node:path';
import { Logger } from '../../shared/classes/logger';
import type { BotEvent } from './types/bot-event.type';

const logger: Logger = new Logger(basename(__filename));

module.exports = {
    name: Events.ShardError,
    async execute(_client: Client, error: Error): Promise<void> {
        logger.error(`${error}`, error);
    },
} as BotEvent;
