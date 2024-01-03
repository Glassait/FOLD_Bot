import { Client, GatewayIntentBits } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { token } from './config.json';
import { Context } from './module/shared/classes/context';
import { Logger } from './module/shared/classes/logger';

const logger: Logger = new Logger(new Context('INDEX'));

logger.debug('🤖 Bot is starting...');

const client: Client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const handlersDir: string = join(__dirname, './module/feature/handlers');

readdirSync(handlersDir).forEach((handler: string): void => {
    if (!handler.endsWith('.ts')) return;

    require(`${handlersDir}/${handler}`)(client);
});

client.login(token).then((value: string): void => {
    if (value) {
        logger.debug('The bot is ready to kick some ass');
    } else {
        logger.error('Failed to connect');
    }
});

const loopsDir: string = join(__dirname, './module/feature/loops');

setTimeout((): void => {
    readdirSync(loopsDir).forEach((loop: string): void => {
        if (!loop.endsWith('.ts')) return;

        require(`${loopsDir}/${loop}`)(client);
    });
}, 500);
