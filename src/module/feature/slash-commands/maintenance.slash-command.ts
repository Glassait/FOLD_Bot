import {
    ChatInputCommandInteraction,
    type Client,
    type Message,
    PermissionsBitField,
    type SlashCommandIntegerOption,
    SlashCommandSubcommandBuilder,
    type TextChannel,
} from 'discord.js';
import { ChannelsTable } from '../../shared/tables/complexe-table/channels/channels.table';
import { TimeUtil } from '../../shared/utils/time.util';
import { UserUtil } from '../../shared/utils/user.util';
import { SlashCommandModel } from './models/slash-command.model';

const channelTable = new ChannelsTable();
const channels: { foldRecruitment?: TextChannel; trivia?: TextChannel } = {};
const messages: { foldRecruitment?: Message<true>; trivia?: Message<true> } = {};

module.exports = new SlashCommandModel(
    'maintenance',
    'Annonce la maintenance du bot',
    async (interaction: ChatInputCommandInteraction, client?: Client): Promise<void> => {
        await interaction.deferReply({ ephemeral: true });

        if (!channels.foldRecruitment) {
            channels.foldRecruitment = await UserUtil.fetchChannelFromClient(client as Client, await channelTable.getFoldRecruitment());
        }
        if (!channels.trivia) {
            channels.trivia = await UserUtil.fetchChannelFromClient(client as Client, await channelTable.getTrivia());
        }

        switch (interaction.options.getSubcommand()) {
            case 'start': {
                const howLong: number = interaction.options.get('how-long')?.value as number;
                const duration: number = interaction.options.get('duration')?.value as number;
                const date = new Date();
                date.setMinutes(date.getMinutes() + howLong);
                const message = `Le bot passe en maintenance : <t:${TimeUtil.convertToUnix(date)}:R> pour ${duration} minute(s)`;

                messages.foldRecruitment = await channels.foldRecruitment.send({
                    content: message,
                });
                messages.trivia = await channels.trivia.send({
                    content: message,
                });
                await interaction.deleteReply();
                break;
            }
            case 'end': {
                const messageFold = await channels.foldRecruitment.send({ content: 'Fin de la maintenance du bot' });
                const messageTrivia = await channels.trivia.send({ content: 'Fin de la maintenance du bot' });

                setTimeout(async () => {
                    if (messages.foldRecruitment) {
                        await messages.foldRecruitment.delete();
                    }

                    if (messages.trivia) {
                        await messages.trivia.delete();
                    }

                    await messageFold.delete();
                    await messageTrivia.delete();
                }, 5000);

                await interaction.deleteReply();
                break;
            }
            default:
                await interaction.editReply({
                    content: 'Commande inconnue',
                });
                break;
        }
    },
    {
        option: [
            new SlashCommandSubcommandBuilder()
                .setName('start')
                .setDescription('Annonce la maintenance du bot')
                .addIntegerOption((builder: SlashCommandIntegerOption) =>
                    builder.setName('how-long').setDescription('Le temps avant la maintenance du bot (en minute)').setRequired(true)
                )
                .addIntegerOption((builder: SlashCommandIntegerOption) =>
                    builder.setName('duration').setDescription('Le temps que va durer la maintenance du bot (en minute)').setRequired(true)
                ),
            new SlashCommandSubcommandBuilder().setName('end').setDescription('Annonce la fin de la maintenance du bot'),
        ],
        permission: PermissionsBitField.Flags.BanMembers,
    }
);
