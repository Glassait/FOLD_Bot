import { Client } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { BotEvent } from '../events/types/bot-event.type';
import { Context } from '../../shared/classes/context';
import { Logger } from '../../shared/classes/logger';

const logger: Logger = new Logger(new Context('EVENT-HANDLER'));

module.exports = async (client: Client): Promise<void> => {
    let eventsDir: string = join(__dirname, '../events');
    let numberOfEvent: number = 0;

    readdirSync(eventsDir).forEach((file: string): void => {
        if (!file.endsWith('.ts')) return;

        const event: BotEvent = require(`${eventsDir}/${file}`).event;

        event.once
            ? client.once(event.name.toString(), (...args: any[]) => event.execute(client, ...args))
            : client.on(event.name.toString(), (...args: any[]) => event.execute(client, ...args));

        numberOfEvent++;
        logger.info(`🌠 Successfully loaded event ${event.name} as \`${event.once ? 'temporary' : 'permanent'}\` listener !`);
    });
    logger.info(`Loaded ${numberOfEvent} events`);
};
