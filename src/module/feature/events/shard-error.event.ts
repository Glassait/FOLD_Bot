import { type Client, Events } from 'discord.js';
import { basename } from 'node:path';
import { Logger } from '../../shared/classes/logger';

const logger: Logger = new Logger(basename(__filename));

module.exports = {
    name: Events.ShardError,
    async execute(_client: Client, error: Error): Promise<void> {
        logger.error(`${error}`, error);
    },
};
