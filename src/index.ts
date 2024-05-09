import { GatewayIntentBits } from 'discord.js';
import { basename } from 'node:path';
import { TriviaSingleton } from './module/shared/singleton/trivia.singleton';
import { EnvUtil } from './module/shared/utils/env.util';
import { Logger } from './module/shared/utils/logger';

const logger: Logger = new Logger(basename(__filename));

logger.info('🤖 Bot is starting...');

// TODO uncomment
// const client: Client = new Client({
//     intents: [
//         GatewayIntentBits.Guilds,
//         GatewayIntentBits.GuildVoiceStates,
//         GatewayIntentBits.GuildMessages,
//         GatewayIntentBits.MessageContent,
//     ],
// });

// Register handlers
// TODO uncomment
// require('./module/feature/handlers/handlers.handler.ts')(client);

// TODO uncomment
// client.login(token).then((value: string): void => {
//     if (value) {
//         logger.info('The bot is ready to kick some ass');
//     } else {
//         logger.error('Failed to connect');
//     }
// });

/**
 * Code to tracked API Errors
 * @see https://discordjs.guide/popular-topics/errors.html#how-to-diagnose-api-errors
 */
// TODO UNCOMMENT
// process.on('unhandledRejection', error => {
//     logger.error('Unhandled promise rejection', error);
// });

/**
 * Event handler for uncaught exceptions in the Node.js process.
 *
 * @param {Error} err - The uncaught exception error object.
 */
process.on('uncaughtException', (err: Error): void => {
    logger.error(`${err}`, err);
});

setTimeout(async (): Promise<void> => {
    const test = TriviaSingleton.instance;

    await EnvUtil.sleep(1000);
    await test.fetchTankOfTheDay();

    throw new Error('END');
});
