import { ChatInputCommandInteraction, CommandInteractionOption, PermissionsBitField, SlashCommandSubcommandBuilder } from 'discord.js';
import { SlashCommandModel } from './model/slash-command.model';
import { SlashCommandStringOption } from '@discordjs/builders';
import { FeatureSingleton } from '../../shared/singleton/feature.singleton';
import { InventorySingleton } from '../../shared/singleton/inventory.singleton';
import { Clan } from '../../shared/types/feature.type';

const feature: FeatureSingleton = FeatureSingleton.instance;
const inventory: InventorySingleton = InventorySingleton.instance;

export const command: SlashCommandModel = new SlashCommandModel(
    'watch-clan',
    'Observe des clans afin de détecté les joueurs qui partent',
    async (interaction: ChatInputCommandInteraction): Promise<void> => {
        await interaction.deferReply({ ephemeral: true });
        const id: CommandInteractionOption | null = interaction.options.get('id');
        const name: CommandInteractionOption | null = interaction.options.get('name');

        if (id && name) {
            const added = feature.addClan({ id: <string>id.value, name: <string>name.value });

            await interaction.editReply({
                content: added ? 'Le clan a bien été ajouté ! Le clan sera observé a partir de demain :)' : 'Le clan existe déjà',
            });
        } else if (id) {
            feature.removeClan(<string>id.value);
            inventory.deleteClan(<string>id.value);

            await interaction.editReply({ content: 'Le clan a bien été supprimé !' });
        } else {
            await interaction.editReply({
                content: feature.clans.reduce((previousValue: string, clan: Clan): string => {
                    return `${previousValue}\nClan : \`${clan.name}\` - id : \`${clan.id}\``;
                }, ''),
            });
        }
    },
    [
        new SlashCommandSubcommandBuilder()
            .setName('add')
            .setDescription('Ajoute un clan à la liste des clans à observer')
            .addStringOption((builder: SlashCommandStringOption) =>
                builder.setName('id').setDescription("L'id du clan à observer").setRequired(true)
            )
            .addStringOption((builder: SlashCommandStringOption) =>
                builder.setName('name').setDescription('Le nom du clan à observer').setRequired(true)
            ),
        new SlashCommandSubcommandBuilder()
            .setName('remove')
            .setDescription('Supprime un clan à la liste des clans à observer')
            .addStringOption((builder: SlashCommandStringOption) =>
                builder.setName('id').setDescription("L'id du clan à supprimer").setRequired(true)
            ),
        new SlashCommandSubcommandBuilder().setName('list').setDescription('Liste des clans à observer'),
    ],
    PermissionsBitField.Flags.KickMembers
);
