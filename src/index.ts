import { Client, GatewayIntentBits } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { token } from './config.json';
import { FeatureSingleton } from './singleton/feature.singleton';
import { InventorySingleton } from './singleton/inventory.singleton';
import { LoggerSingleton } from './singleton/logger.singleton';
import { Context } from './utils/context.class';

const logger: LoggerSingleton = LoggerSingleton.instance;
const context: Context = new Context('INDEX');

logger.debug(context, '🤖 Bot is starting...');

const _feature: FeatureSingleton = FeatureSingleton.instance;
const inventory: InventorySingleton = InventorySingleton.instance;

const client: Client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages],
});

const handlersDir: string = join(__dirname, './handlers');

readdirSync(handlersDir).forEach((handler: string): void => {
    require(`${handlersDir}/${handler}`)(client);
});

client.login(token).then((value: string): void => {
    if (value) {
        logger.debug(context, 'The bot is ready to kick some ass');
    } else {
        logger.error(context, 'Failed to connect');
    }
});

setTimeout((): void => {
    (async (): Promise<void> => {
        await inventory.scrapWebSite(client);
    })();
}, 500);
