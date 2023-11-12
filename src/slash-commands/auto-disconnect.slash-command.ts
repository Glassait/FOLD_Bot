import { SlashCommandMentionableOption } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, PermissionsBitField } from 'discord.js';
import { FeatureSingleton } from '../singleton/feature.singleton';
import { SlashCommand } from '../utils/slash-command.class';
import { UserUtils } from '../utils/user.utils';

export const command: SlashCommand = new SlashCommand(
    'auto-disconnect',
    "Pour déconnecter automatiquement quelqu'un d'un channel vocal",
    async (interaction: ChatInputCommandInteraction): Promise<void> => {
        const targetUser: GuildMember | undefined = await UserUtils.getGuildMemberFromInteraction(
            interaction,
            'target'
        );

        const feature: FeatureSingleton = FeatureSingleton.instance;
        if (targetUser) {
            feature.autoDisconnect = targetUser.id.toString();
            await require('./disconnect.slash-command').command.execute(interaction);
            await interaction.editReply({
                content: 'Déconnexion automatique activé, un vrai 😈 😈 😈',
            });
        } else {
            feature.autoDisconnect = '';
            await interaction.editReply({
                content:
                    "Déconnexion automatique désactivée, c'est bien de laisser les gens vivre !",
            });
        }
    },
    [
        {
            optionType: 'MentionableOption',
            base: new SlashCommandMentionableOption()
                .setName('target')
                .setDescription(
                    "L'utilisateur à déconnecter automatiquement. Laisser vide pour désactiver"
                ),
        },
    ],
    PermissionsBitField.Flags.MoveMembers
);
