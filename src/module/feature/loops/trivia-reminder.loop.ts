import { type Client, Colors, EmbedBuilder, type TextChannel } from 'discord.js';
import { basename } from 'node:path';
import { Logger } from '../../shared/classes/logger';
import { EmojiEnum } from '../../shared/enums/emoji.enum';
import { InventorySingleton } from '../../shared/singleton/inventory.singleton';
import { TimeUtil } from '../../shared/utils/time.util';
import { UserUtil } from '../../shared/utils/user.util';
import type { BotLoop } from './types/bot-loop.type';

module.exports = {
    name: 'Fold Recruitment',
    execute: async (client: Client): Promise<void> => {
        const logger: Logger = new Logger(basename(__filename));
        const inventory: InventorySingleton = InventorySingleton.instance;

        if (!inventory.getFeatureFlipping('trivia')) {
            logger.warn("Trivia feature disabled, if it's normal, dont mind this message!");
            return;
        }

        const req = require('../../shared/tables/channels.table');
        const channels = new req.ChannelsTable();

        const channel: TextChannel = await UserUtil.fetchChannelFromClient(client, await channels.getTrivia());

        await TimeUtil.forLoopTimeSleep(['20:00'], `${EmojiEnum.LOOP} Trivia reminder`, async (): Promise<void> => {
            await channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`${EmojiEnum.LOOP} Rappel pour le Trivia ${EmojiEnum.LOOP}`)
                        .setColor(Colors.Blue)
                        .setDescription(
                            `Pour ceux qui ne l'on pas encore fait, n'oublier pas de faire au moins une questions aujourd'hui sinon vous risquez de perdre des points. (plus d'info avec la commande \`/trivia rule\`)`
                        ),
                ],
            });
        });
    },
} as BotLoop;
