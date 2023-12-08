import { Client } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { LoggerSingleton } from '../../shared/singleton/logger.singleton';
import { BotEvent } from '../../shared/types/bot-event.type';
import { Context } from '../../shared/utils/context.class';

const logger: LoggerSingleton = LoggerSingleton.instance;
const context: Context = new Context('EVENT-HANDLER');

module.exports = async (client: Client): Promise<void> => {
    let eventsDir: string = join(__dirname, '../events');
    let numberOfEvent: number = 0;

    readdirSync(eventsDir).forEach((file: string): void => {
        if (!file.endsWith('.ts')) return;

        const event: BotEvent = require(`${eventsDir}/${file}`).default;

        event.once ? client.once(event.name, (...args: any[]) => event.execute(client, ...args)) : client.on(event.name, (...args: any[]) => event.execute(client, ...args));

        numberOfEvent++;
        logger.info(context, `🌠 Successfully loaded event ${event.name}`);
    });
    logger.info(context, `Loaded ${numberOfEvent} events`);
};