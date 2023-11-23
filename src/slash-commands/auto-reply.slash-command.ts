import { SlashCommandMentionableOption, SlashCommandStringOption } from '@discordjs/builders';
import { ChatInputCommandInteraction, CommandInteractionOption, GuildMember } from 'discord.js';
import { FeatureSingleton } from '../singleton/feature.singleton';
import { SlashCommand } from '../utils/slash-command.class';
import { UserUtil } from '../utils/user.util';

export const command: SlashCommand = new SlashCommand(
    'auto-reply',
    "Pour répondre automatiquement lorsqu'une personne vous mention",
    async (interaction: ChatInputCommandInteraction): Promise<void> => {
        const targetUser: GuildMember | undefined = await UserUtil.getGuildMemberFromInteraction(
            interaction,
            'target',
            true
        );
        const option: CommandInteractionOption | null = interaction.options.get('désactiver');

        const feature: FeatureSingleton = FeatureSingleton.instance;

        if (targetUser && !option) {
            const alreadyAutoReply: boolean = feature.hasAutoReplyTo(
                interaction.user.id,
                targetUser.id
            );

            if (alreadyAutoReply) {
                await interaction.editReply({
                    content: `Tu as déjà une réponse automatique mis en place pour <@${targetUser.id}>`,
                });
                return;
            }

            feature.pushAutoReply({ activateFor: interaction.user.id, replyTo: targetUser.id });
            await interaction.editReply({
                content: `Réponse automatique mis en place pour <@${targetUser.id}>`,
            });
        } else if (targetUser) {
            feature.deleteAutoReply(interaction.user.id, targetUser.id);
            await interaction.editReply({
                content: `Réponse automatique désactiver pour <@${targetUser.id}>`,
            });
        } else {
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
                .setDescription(
                    "Renseigner pour désactiver la réponse automatique pour l'utilisateur"
                )
                .setChoices({ name: 'oui', value: 'oui' }),
        },
    ]
);
