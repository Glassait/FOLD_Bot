import { Client, Events } from 'discord.js';
import { BotEvent } from './types/bot-event.type';
import { Logger } from '../../shared/classes/logger';
import { Context } from '../../shared/classes/context';

const logger: Logger = new Logger(new Context('NAME-EVENT'));

export const event: BotEvent = {
    name: Events.ShardError,
    async execute(_client: Client, error: Error): Promise<void> {
        logger.error(`${error}`);
    },
};
