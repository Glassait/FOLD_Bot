import { type ChatInputCommandInteraction, type Client, PermissionsBitField } from 'discord.js';
import { FeatureFlippingTable } from '../../shared/tables/complexe-table/feature-flipping/feature-flipping.table';
import { SlashCommandModel } from './models/slash-command.model';

module.exports = new SlashCommandModel(
    'detected-clan',
    "Affiche l'ensemble des clans détectés après l'analyse des joueurs",
    async (interaction: ChatInputCommandInteraction, client?: Client): Promise<void> => {
        await interaction.deferReply({ ephemeral: true });
        const featureFlippingTable: FeatureFlippingTable = new FeatureFlippingTable();

        if (!(await featureFlippingTable.getFeature('detected_clan'))) {
            await interaction.editReply({
                content:
                    "La detection de clan sur les joueurs ayant quittés leur clan est désactivé par l'administrateur <@313006042340524033>.",
            });
            return;
        }

        const req = require('./models/detected-clan.model');
        const detectedClanModel = new req.DetectedClanModel();

        if (!(await detectedClanModel.haveClanToProcess())) {
            await interaction.editReply({ content: 'Aucun clan potentiel est présent dans la liste' });
            return;
        }

        await detectedClanModel.initialize(client);
        await interaction.deleteReply();
        await detectedClanModel.processClans();
    },
    {
        permission: PermissionsBitField.Flags.MoveMembers,
    }
);
