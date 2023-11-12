import { SlashCommandMentionableOption, SlashCommandStringOption } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { FeatureSingleton } from '../singleton/feature.singleton';
import { SlashCommand } from '../utils/slash-command.class';
import { UserUtils } from '../utils/user.utils';

export const command: SlashCommand = new SlashCommand(
    'auto-reply',
    "Pour répondre automatiquement lorsqu'une personne vous mention",
    async (interaction: ChatInputCommandInteraction): Promise<void> => {
        const targetUser: GuildMember | undefined = await UserUtils.getGuildMemberFromInteraction(
            interaction,
            'target',
            true
        );

        const feature: FeatureSingleton = FeatureSingleton.instance;

        if (targetUser) {
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
            feature.pushAutoreply({ activateFor: interaction.user.id, replyTo: targetUser.id });
            await interaction.editReply({
                content: 'Réponse automatique mis en place',
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
                ),
        },
    ]
);
