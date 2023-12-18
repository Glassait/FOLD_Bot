import { SlashCommandMentionableOption } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, PermissionsBitField } from 'discord.js';
import { FeatureSingleton } from '../../shared/singleton/feature.singleton';
import { Context } from '../../shared/classes/context';
import { SlashCommand } from './model/slash-command';
import { UserUtil } from '../../shared/utils/user.util';
import { Logger } from '../../shared/classes/logger';

const logger: Logger = new Logger(new Context('AUTO-DISCONNECT-SLASH-COMMAND'));

export const command: SlashCommand = new SlashCommand(
    'auto-disconnect',
    "Pour déconnecter automatiquement quelqu'un d'un channel vocal",
    async (interaction: ChatInputCommandInteraction): Promise<void> => {
        const targetUser: GuildMember | undefined = await UserUtil.getGuildMemberFromInteraction(interaction, 'target');

        const feature: FeatureSingleton = FeatureSingleton.instance;
        if (targetUser) {
            logger.info(`AutoDisconnect activated on \`${targetUser.displayName}\``);
            feature.autoDisconnect = targetUser.id.toString();
            await require('./disconnect.slash-command').command.execute(interaction);
            await interaction.editReply({
                content: 'Déconnexion automatique activé, un vrai 😈 😈 😈',
            });
        } else {
            logger.info(`AutoDisconnect deactivated`);
            feature.autoDisconnect = '';
            await interaction.editReply({
                content: "Déconnexion automatique désactivée, c'est bien de laisser les gens vivre !",
            });
        }
    },
    [
        new SlashCommandMentionableOption()
            .setName('target')
            .setDescription("L'utilisateur à déconnecter automatiquement. Laisser vide pour désactiver"),
    ],
    PermissionsBitField.Flags.MoveMembers
);
