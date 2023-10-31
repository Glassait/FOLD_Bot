import { SlashCommandMentionableOption } from '@discordjs/builders';
import {
    ChatInputCommandInteraction,
    CommandInteractionOption,
    Guild,
    GuildMember,
    PermissionsBitField,
} from 'discord.js';
import { SlashCommand } from '../utils/slash-command.class';

export const command: SlashCommand = new SlashCommand(
    'disconnect',
    "Pour virer quelqu'un d'un channel vocal",
    async (interaction: ChatInputCommandInteraction): Promise<void> => {
        const option: CommandInteractionOption | null = interaction.options.get('target');
        const guild: Guild | null = interaction.guild;
        const targetId: string | number | boolean | undefined = option?.value;

        await interaction.deferReply({
            ephemeral: true,
        });

        if (!option || !guild || !targetId) {
            await interaction.editReply({
                content: 'Technical error :(',
            });
            return;
        }

        const targetUser: GuildMember = await guild.members.fetch(targetId.toString());

        if (!targetUser) {
            await interaction.editReply({
                content: "L'utilisateur n'existe pas !",
            });
            return;
        }

        try {
            await targetUser.voice.disconnect();
            await interaction.editReply({
                content: "L'utilisateur a été déconnecté",
            });
        } catch (error) {
            await interaction.editReply({
                content: `Il y a eu un problème au moment de déconnecté ${targetUser.nickname}, erreur: ${error}`,
            });
            console.error(`error kick: ${error}`);
            return;
        }
    },
    {
        optionType: 'MentionableOption',
        base: new SlashCommandMentionableOption()
            .setName('target')
            .setDescription("L'utilisateu à déconnecter")
            .setRequired(true),
    },
    PermissionsBitField.Flags.MoveMembers
);
