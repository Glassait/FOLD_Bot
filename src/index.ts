import { Client, GatewayIntentBits } from 'discord.js';
import { basename } from 'node:path';
import { token } from './module/core/config.json';
import { isDev } from 'utils/env.util';
import { Logger } from 'utils/logger';
import { BotDatabaseSingleton } from 'singleton/bot-database.singleton';
import { FoldDatabaseSingleton } from 'singleton/fold-database.singleton';

const logger: Logger = new Logger(basename(__filename));

if (isDev()) {
    // eslint-disable-next-line no-console
    console.warn(
        '===========================================================\n    Bot launch on DEV. This mode is not for production.\n===========================================================`'
    );
}

logger.info('🤖 Bot is starting...');

const client: Client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Register handlers
require('./module/feature/handlers/handlers.handler.ts')(client);

client
    .login(String(token))
    .then((value: string): void => {
        if (value) {
            logger.info('The bot is ready to kick some ass');
        } else {
            logger.error('Failed to connect, error');
        }
    })
    .catch((reason: unknown) => logger.error('Failed to connect', reason));

/**
 * Code to tracked API Errors
 * @see https://discordjs.guide/popular-topics/errors.html#how-to-diagnose-api-errors
 */
process.on('unhandledRejection', error => {
    logger.error('Unhandled promise rejection', error);
});

/**
 * Event handler for uncaught exceptions in the Node.js process.
 *
 * @param {Error} err - The uncaught exception error object.
 */
process.on('uncaughtException', (err: Error): void => {
    logger.error(`The Uncaught Exception with name : \`${err.name}\` practically crash the bot !`, err);
});

/**
 * Ending pool connection before ending connection to respect the best practice
 */
async function cleanUp() {
    logger.info('Start cleanup');
    await BotDatabaseSingleton.instance.endPool();
    await FoldDatabaseSingleton.instance.endPool();
    logger.info('Cleanup end successfully. Shutting down the bot !');
}

// Handle application shutdown
process.on('SIGINT', async () => {
    await cleanUp();
    process.exit('SIGINT');
});

process.on('SIGTERM', async () => {
    await cleanUp();
    process.exit('SIGTERM');
});

process.on('exit', (code: number): void => {
    logger.warn('Bot shutting down with code {}', code);
});
