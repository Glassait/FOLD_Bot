import { Client, Events } from 'discord.js';
import { BotEvent } from './types/bot-event.type';
import { Logger } from '../../shared/classes/logger';
import { basename } from 'node:path';

const logger: Logger = new Logger(basename(__filename));

module.exports = {
    name: Events.Error,
    async execute(_client: Client, error: Error): Promise<void> {
        logger.error(`${error}`, error);
    },
} as BotEvent;
