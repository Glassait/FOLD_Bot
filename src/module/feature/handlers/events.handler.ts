import type { Client } from 'discord.js';
import { readdirSync } from 'fs';
import { basename } from 'node:path';
import { join } from 'path';
import { EmojiEnum } from '../../shared/enums/emoji.enum';
import { Logger } from '../../shared/utils/logger';
import type { BotEvent } from '../events/types/bot-event.type';

module.exports = (client: Client): void => {
    const logger: Logger = new Logger(basename(__filename));
    const eventsDir: string = join(__dirname, '../events');
    let numberOfEvents: number = 0;

    readdirSync(eventsDir).forEach((file: string): void => {
        if (!file.endsWith('.ts')) return;

        const event: BotEvent = require(`${eventsDir}/${file}`) as BotEvent;

        event.once
            ? // eslint-disable-next-line
              client.once(event.name.toString(), (...args: any[]) => event.execute(client, ...args))
            : // eslint-disable-next-line
              client.on(event.name.toString(), (...args: any[]) => event.execute(client, ...args));

        ++numberOfEvents;
        logger.info(`${EmojiEnum.STAR} Successfully loaded event {} as {} listener !`, event.name, event.once ? 'temporary' : 'permanent');
    });
    logger.debug(`Loaded ${numberOfEvents} events`);
};
