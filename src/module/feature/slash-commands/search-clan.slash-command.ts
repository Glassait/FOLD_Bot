import { type ChatInputCommandInteraction, type Client, Colors, EmbedBuilder, PermissionsBitField, type TextChannel } from 'discord.js';
import { InventorySingleton } from '../../shared/singleton/inventory.singleton';
import { PotentialClanTable } from '../../shared/tables/potential-clan.table';
import type { PotentialClan } from '../../shared/types/potential-clan.type';
import { SlashCommandModel } from './model/slash-command.model';

module.exports = new SlashCommandModel(
    'search-clan',
    "Affiche l'ensemble des clans détectés après l'analyse des joueurs",
    async (interaction: ChatInputCommandInteraction, client?: Client): Promise<void> => {
        const potentialClan: PotentialClanTable = new PotentialClanTable();
        const clans: PotentialClan[] = await potentialClan.getAll();

        if (clans.length === 0) {
            await interaction.reply({
                ephemeral: true,
                content: 'Aucun clan potentiel est présent dans la liste',
            });
            return;
        }

        const inventory: InventorySingleton = InventorySingleton.instance;
        const channel: TextChannel = await inventory.getChannelForFoldRecruitment(client as Client);

        const numberOfEmbed: number = Math.floor(clans.length / 40) || 1;
        let index: number = 0;

        for (let i = 0; i < numberOfEmbed; i++) {
            const embed: EmbedBuilder = new EmbedBuilder().setTitle('Liste des clans détectés').setColor(Colors.DarkGold);

            for (let j = 0; j < 3; j++) {
                let message: string = '';
                while (message.length < 950 && index < clans.length) {
                    const potentialClan: string = clans[index].url;
                    message += `[${potentialClan.slice(35, 44)}](${potentialClan})\n`;
                    index++;
                }

                if (message) {
                    embed.addFields({
                        name: `Page ${j + 1}/3`,
                        value: message,
                        inline: true,
                    });
                }
            }

            await channel.send({ embeds: [embed] });
        }

        await potentialClan.deleteAll();
    },
    {
        permission: PermissionsBitField.Flags.MoveMembers,
    }
);
