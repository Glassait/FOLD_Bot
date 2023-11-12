import { Client, GatewayIntentBits } from 'discord.js';
import { readdirSync, readFileSync, writeFile } from 'fs';
import { join } from 'path';
import { token } from './config.json';
import { FeatureSingleton } from './singleton/feature.singleton';

console.log('🤖 Bot is starting...');

const feature: FeatureSingleton = FeatureSingleton.instance;

try {
    const json: Buffer = readFileSync(FeatureSingleton.path);

    if (json.toString()) {
        feature.data = JSON.parse(json.toString());
    } else {
        feature.data = { version: 0, auto_reply: [], auto_disconnect: '' };
    }
} catch (e) {
    writeFile(FeatureSingleton.path, JSON.stringify(feature.data), err => {
        if (err) {
            throw err;
        }
        console.log('📁 Feature file created');
    });
}

const client: Client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
    ],
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
