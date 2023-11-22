import { Client, GatewayIntentBits } from 'discord.js';
import { readdirSync, readFileSync, writeFile } from 'fs';
import { join } from 'path';
import { token } from './config.json';
import { FeatureSingleton } from './singleton/feature.singleton';
import { InventorySingleton } from './singleton/inventory.singleton';
import { LoggerSingleton } from './singleton/logger.singleton';
import { Context } from './utils/context.class';

const logger: LoggerSingleton = LoggerSingleton.instance;
logger.createLogFile();
const context: Context = new Context('INDEX');

logger.debug(context.context, '🤖 Bot is starting...');

const feature: FeatureSingleton = FeatureSingleton.instance;
const inventory: InventorySingleton = InventorySingleton.instance;

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
        logger.error(context.context, '📁 Feature file created');
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
        logger.debug(context.context, 'The bot is ready to kick some ass');
    } else {
        logger.error(context.context, 'Failed to connect');
    }
});

setTimeout(() => {
    inventory.scrapWebSite(client).then();
}, 500);
