import type { Client } from 'discord.js';
import { Events } from 'discord.js';
import { basename } from 'node:path';
import { Logger } from '../../shared/utils/logger';
import type { BotEvent } from './types/bot-event.type';

const logger: Logger = new Logger(basename(__filename));

module.exports = {
    name: Events.Error,
    async execute(_client: Client, error: Error): Promise<void> {
        logger.error(`${error}`, error);
    },
} as BotEvent;
