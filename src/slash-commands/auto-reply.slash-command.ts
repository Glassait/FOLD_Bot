import { SlashCommandMentionableOption, SlashCommandStringOption } from '@discordjs/builders';
import { ChatInputCommandInteraction, CommandInteractionOption, GuildMember } from 'discord.js';
import { FeatureSingleton } from '../singleton/feature.singleton';
import { LoggerSingleton } from '../singleton/logger.singleton';
import { Context } from '../utils/context.class';
import { SendUtils } from '../utils/send.utils';
import { SlashCommand } from '../utils/slash-command.class';
import { UserUtil } from '../utils/user.util';

const logger: LoggerSingleton = LoggerSingleton.instance;
const context: Context = new Context('AUTO-REPLY-SLASH-COMMAND');

export const command: SlashCommand = new SlashCommand(
    'auto-reply',
    "Pour répondre automatiquement lorsqu'une personne vous mention",
    async (interaction: ChatInputCommandInteraction): Promise<void> => {
        const targetUser: GuildMember | undefined = await UserUtil.getGuildMemberFromInteraction(interaction, 'target', true);
        const option: CommandInteractionOption | null = interaction.options.get('désactiver');
        const feature: FeatureSingleton = FeatureSingleton.instance;

        if (targetUser && !option) {
            const alreadyAutoReply: boolean = feature.hasAutoReplyTo(interaction.user.id, targetUser.id);

            if (alreadyAutoReply) {
                logger.info(context, `AutoReply already activated for \`${interaction.user.displayName}\` to reply to \`${targetUser.displayName}\``);
                await SendUtils.editReply(interaction, {
                    content: `Tu as déjà une réponse automatique mis en place pour <@${targetUser.id}>`,
                });
                return;
            }

            logger.info(context, `AutoReply activated for \`${interaction.user.displayName}\` to reply to \`${targetUser.displayName}\``);
            feature.pushAutoReply({ activateFor: interaction.user.id, replyTo: targetUser.id });
            await SendUtils.editReply(interaction, {
                content: `Réponse automatique mis en place pour <@${targetUser.id}>`,
            });
        } else if (targetUser) {
            feature.deleteAutoReply(interaction.user.id, targetUser.id);
            logger.info(context, `AutoReply deactivated for \`${interaction.user.displayName}\` to reply to \`${targetUser.displayName}\``);
            await SendUtils.editReply(interaction, {
                content: `Réponse automatique désactiver pour <@${targetUser.id}>`,
            });
        } else {
            logger.warning(context, 'Technical error when activating autoReply');
            await SendUtils.editReply(interaction, {
                content: 'Technical error',
            });
        }
    },
    [
        {
            optionType: 'MentionableOption',
            base: new SlashCommandMentionableOption().setName('target').setDescription("L'utilisateur à répondre automatiquement.").setRequired(true),
        },
        {
            optionType: 'StringOption',
            base: new SlashCommandStringOption().setName('désactiver').setDescription("Renseigner pour désactiver la réponse automatique pour l'utilisateur").setChoices({ name: 'oui', value: 'oui' }),
        },
    ]
);
