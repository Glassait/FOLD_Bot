import { SlashCommandMentionableOption } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, PermissionsBitField } from 'discord.js';
import { Context } from '../../shared/classes/context';
import { SlashCommandModel } from './model/slash-command.model';
import { UserUtil } from '../../shared/utils/user.util';
import { Logger } from '../../shared/classes/logger';

const logger: Logger = new Logger(new Context('DISCONNECT-SLASH-COMMAND'));

export const command: SlashCommandModel = new SlashCommandModel(
    'disconnect',
    "Pour déconnecter quelqu'un d'un channel vocal",
    async (interaction: ChatInputCommandInteraction): Promise<void> => {
        const targetUser: GuildMember | undefined = await UserUtil.getGuildMemberFromInteraction(interaction, 'target', true);

        if (!targetUser) {
            return;
        }

        try {
            logger.debug(`Disconnect user {}`, targetUser.displayName);
            await targetUser.voice.disconnect();
            await interaction.editReply({
                content: "L'utilisateur a été déconnecté, c'est méchant mais c'est toi qui décide...",
            });
        } catch (error) {
            logger.error(`Error when disconnecting: ${error}`, error);
            await interaction.editReply({
                content: `Il y a eu un problème au moment de déconnecté ${targetUser.displayName}, erreur: ${error}`,
            });
            return;
        }
    },
    {
        option: [new SlashCommandMentionableOption().setName('target').setDescription("L'utilisateur à déconnecter").setRequired(true)],
        permission: PermissionsBitField.Flags.MoveMembers,
    }
);
