import { SlashCommandMentionableOption } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, PermissionsBitField } from 'discord.js';
import { SlashCommand } from '../utils/slash-command.class';
import { UserUtils } from '../utils/user.utils';

export const command: SlashCommand = new SlashCommand(
    'disconnect',
    "Pour déconnecter quelqu'un d'un channel vocal",
    async (interaction: ChatInputCommandInteraction): Promise<void> => {
        const targetUser: GuildMember | undefined = await UserUtils.getGuildMemberFromInteraction(
            interaction,
            'target',
            true
        );

        if (!targetUser) {
            return;
        }

        try {
            await targetUser.voice.disconnect();
            await interaction.editReply({
                content:
                    "L'utilisateur a été déconnecté, c'est méchant mais c'est toi qui décide...",
            });
        } catch (error) {
            await interaction.editReply({
                content: `Il y a eu un problème au moment de déconnecté ${targetUser.nickname}, erreur: ${error}`,
            });
            console.error(`error kick: ${error}`);
            return;
        }
    },
    [
        {
            optionType: 'MentionableOption',
            base: new SlashCommandMentionableOption()
                .setName('target')
                .setDescription("L'utilisateur à déconnecter")
                .setRequired(true),
        },
    ],
    PermissionsBitField.Flags.MoveMembers
);
