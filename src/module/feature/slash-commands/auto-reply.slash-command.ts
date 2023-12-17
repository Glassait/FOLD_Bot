import { SlashCommandMentionableOption, SlashCommandStringOption } from '@discordjs/builders';
import { ChatInputCommandInteraction, CommandInteractionOption, GuildMember } from 'discord.js';
import { FeatureSingleton } from '../../shared/singleton/feature.singleton';
import { Context } from '../../shared/classes/context';
import { SlashCommand } from '../../shared/classes/slash-command';
import { UserUtil } from '../../shared/utils/user.util';
import { Logger } from '../../shared/classes/logger';

const logger: Logger = new Logger(new Context('AUTO-REPLY-SLASH-COMMAND'));

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
                logger.info(
                    `AutoReply already activated for \`${interaction.user.displayName}\` to reply to \`${targetUser.displayName}\``
                );
                await interaction.editReply({
                    content: `Tu as déjà une réponse automatique mis en place pour <@${targetUser.id}>`,
                });
                return;
            }

            logger.info(`AutoReply activated for \`${interaction.user.displayName}\` to reply to \`${targetUser.displayName}\``);
            feature.pushAutoReply({ activateFor: interaction.user.id, replyTo: targetUser.id });
            await interaction.editReply({
                content: `Réponse automatique mis en place pour <@${targetUser.id}>`,
            });
        } else if (targetUser) {
            logger.info(`AutoReply deactivated for \`${interaction.user.displayName}\` to reply to \`${targetUser.displayName}\``);
            feature.deleteAutoReply(interaction.user.id, targetUser.id);
            await interaction.editReply({
                content: `Réponse automatique désactiver pour <@${targetUser.id}>`,
            });
        } else {
            logger.warning('Technical error when activating autoReply');
            await interaction.editReply({
                content: 'Technical error',
            });
        }
    },
    [
        {
            optionType: 'MentionableOption',
            base: new SlashCommandMentionableOption()
                .setName('target')
                .setDescription("L'utilisateur à répondre automatiquement.")
                .setRequired(true),
        },
        {
            optionType: 'StringOption',
            base: new SlashCommandStringOption()
                .setName('désactiver')
                .setDescription("Renseigner pour désactiver la réponse automatique pour l'utilisateur")
                .setChoices({ name: 'oui', value: 'oui' }),
        },
    ]
);
