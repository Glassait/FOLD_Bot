import { ChatInputCommandInteraction, PermissionsBitField, SlashCommandIntegerOption } from 'discord.js';
import { SlashCommandModel } from './models/slash-command.model';
import { ClanPlayersActivityModel } from './models/clan-players-activity.model';

module.exports = new SlashCommandModel(
    'clan-players-activity',
    "Affiche les joueurs dont l'activité est en dessous du nombre fourni.",
    async (interaction: ChatInputCommandInteraction): Promise<void> => {
        await interaction.deferReply({ ephemeral: true });
        const numberOfBattles: number = interaction.options.get('bataille-minimun')?.value as number;

        await new ClanPlayersActivityModel().showPlayersUnderActivity(numberOfBattles, interaction);
    },
    {
        permission: PermissionsBitField.Flags.MoveMembers,
        option: [
            new SlashCommandIntegerOption()
                .setName('bataille-minimun')
                .setDescription('Affiche les joueurs avec moins de batailles requises.')
                .setRequired(true),
        ],
    }
);
