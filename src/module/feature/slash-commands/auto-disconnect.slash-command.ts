import { SlashCommandMentionableOption } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, PermissionsBitField } from 'discord.js';
import { FeatureSingleton } from '../../shared/singleton/feature.singleton';
import { LoggerSingleton } from '../../shared/singleton/logger.singleton';
import { Context } from '../../shared/utils/context.class';
import { SlashCommand } from '../../shared/utils/slash-command.class';
import { UserUtil } from '../../shared/utils/user.util';

const logger: LoggerSingleton = LoggerSingleton.instance;
const context: Context = new Context('AUTO-DISCONNECT-SLASH-COMMAND');

export const command: SlashCommand = new SlashCommand(
    'auto-disconnect',
    "Pour déconnecter automatiquement quelqu'un d'un channel vocal",
    async (interaction: ChatInputCommandInteraction): Promise<void> => {
        const targetUser: GuildMember | undefined = await UserUtil.getGuildMemberFromInteraction(interaction, 'target');

        const feature: FeatureSingleton = FeatureSingleton.instance;
        if (targetUser) {
            logger.info(context, `AutoDisconnect activated on \`${targetUser.displayName}\``);
            feature.autoDisconnect = targetUser.id.toString();
            await require('./disconnect.slash-command').command.execute(interaction);
            await interaction.editReply({
                content: 'Déconnexion automatique activé, un vrai 😈 😈 😈',
            });
        } else {
            logger.info(context, `AutoDisconnect deactivated`);
            feature.autoDisconnect = '';
            await interaction.editReply({
                content: "Déconnexion automatique désactivée, c'est bien de laisser les gens vivre !",
            });
        }
    },
    [
        {
            optionType: 'MentionableOption',
            base: new SlashCommandMentionableOption().setName('target').setDescription("L'utilisateur à déconnecter automatiquement. Laisser vide pour désactiver"),
        },
    ],
    PermissionsBitField.Flags.MoveMembers
);
