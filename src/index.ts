import { Client, GatewayIntentBits } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { token } from './config.json';

console.log('🤖 Bot is starting...');

const client: Client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

const handlersDir: string = join(__dirname, './handlers');

readdirSync(handlersDir).forEach((handler: string): void => {
    require(`${handlersDir}/${handler}`)(client);
});

client.login(token).then((value: string): void => {
    if (value) {
        console.log('The bot is ready to kick some ass');
    } else {
        console.error('Failed to connect');
    }
});
