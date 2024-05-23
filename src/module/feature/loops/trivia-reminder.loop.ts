import { type Client, Colors, EmbedBuilder, type TextChannel } from 'discord.js';
import { basename } from 'node:path';
import { EmojiEnum } from '../../shared/enums/emoji.enum';
import type { CronsTable } from '../../shared/tables/complexe-table/crons/crons.table';
import { FeatureFlippingTable } from '../../shared/tables/complexe-table/feature-flipping/feature-flipping.table';
import { CronUtil } from '../../shared/utils/cron.util';
import { Logger } from '../../shared/utils/logger';
import { UserUtil } from '../../shared/utils/user.util';
import type { BotLoop } from './types/bot-loop.type';

module.exports = {
    name: 'Fold Recruitment',
    execute: async (client: Client): Promise<void> => {
        const logger: Logger = new Logger(basename(__filename));
        const features: FeatureFlippingTable = new FeatureFlippingTable();

        if (!(await features.getFeature('trivia'))) {
            logger.warn("Trivia feature disabled, if it's normal, dont mind this message!");
            return;
        }

        let req = require('../../shared/tables/complexe-table/channels/channels.table');
        const channelsTable = new req.ChannelsTable();

        req = require('../../shared/tables/complexe-table/crons/crons.table');
        const cronsTable: CronsTable = new req.CronsTable();

        const channel: TextChannel = await UserUtil.fetchChannelFromClient(client, await channelsTable.getTrivia());

        CronUtil.createCron(await cronsTable.getCron('trivia'), 'trivia', async (): Promise<void> => {
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
