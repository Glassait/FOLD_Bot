import { SlashCommandMentionableOption } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, PermissionsBitField } from 'discord.js';
import { LoggerSingleton } from '../singleton/logger.singleton';
import { Context } from '../utils/context.class';
import { SendUtils } from '../utils/send.utils';
import { SlashCommand } from '../utils/slash-command.class';
import { UserUtil } from '../utils/user.util';

const logger: LoggerSingleton = LoggerSingleton.instance;
const context: Context = new Context('COMMANDS-HANDLER');

export const command: SlashCommand = new SlashCommand(
    'disconnect',
    "Pour déconnecter quelqu'un d'un channel vocal",
    async (interaction: ChatInputCommandInteraction): Promise<void> => {
        const targetUser: GuildMember | undefined = await UserUtil.getGuildMemberFromInteraction(interaction, 'target', true);

        if (!targetUser) {
            return;
        }

        try {
            logger.trace(context.context, `Disconnect user \`${targetUser.displayName}\``);
            await targetUser.voice.disconnect();
            await SendUtils.editReply(interaction, {
                content: "L'utilisateur a été déconnecté, c'est méchant mais c'est toi qui décide...",
            });
        } catch (error) {
            await SendUtils.editReply(interaction, {
                content: `Il y a eu un problème au moment de déconnecté ${targetUser.displayName}, erreur: ${error}`,
            });
            logger.error(context.context, `Error when disconnecting: ${error}`);
            return;
        }
    },
    [
        {
            optionType: 'MentionableOption',
            base: new SlashCommandMentionableOption().setName('target').setDescription("L'utilisateur à déconnecter").setRequired(true),
        },
    ],
    PermissionsBitField.Flags.MoveMembers
);
