import { Client } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { BotEvent } from '../types/bot-event.type';

module.exports = (client: Client): void => {
    let eventsDir: string = join(__dirname, '../events');

    readdirSync(eventsDir).forEach((file: string): void => {
        if (!file.endsWith('.ts')) return;

        const event: BotEvent = require(`${eventsDir}/${file}`).default;

        event.once
            ? client.once(event.name, (...args: any[]) => event.execute(client, ...args))
            : client.on(event.name, (...args: any[]) => event.execute(client, ...args));

        console.log(`🌠 Successfully loaded event ${event.name}`);
    });
};
