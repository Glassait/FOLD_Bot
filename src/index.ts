import { Client, GatewayIntentBits } from 'discord.js';
import { basename } from 'node:path';
import { token } from './module/core/config.json';
import { isDev } from 'utils/env.util';
import { Logger } from 'utils/logger';

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
    logger.error(err.name, err);
});
