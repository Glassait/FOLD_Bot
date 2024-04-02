import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    Client,
    PermissionsBitField,
    SlashCommandSubcommandBuilder,
} from 'discord.js';
import { SlashCommandModel } from './model/slash-command.model';
import { SlashCommandStringOption } from '@discordjs/builders';
import { WatchClanModel } from './model/watch-clan.model';

const MAPPING = {
    ADD: {
        name: 'add',
        optionsName: ['id', 'name'],
    },
    REMOVE: {
        name: 'remove',
        optionsName: ['id-ou-name'],
    },
    STATS: {
        name: 'statistics',
        optionsName: ['id-ou-name'],
    },
    BLACKLIST_PLAYER: {
        name: 'blacklist-player',
        optionsName: ['player-name', 'reason'],
    },
    UNBLACKLIST_PLAYER: {
        name: 'unblacklist-player',
        optionsName: ['player-name'],
    },
};
const watchClan: WatchClanModel = new WatchClanModel();

export const command: SlashCommandModel = new SlashCommandModel(
    'watch-clan',
    'Observe des clans afin de détecté les joueurs qui partent',
    async (interaction: ChatInputCommandInteraction, client?: Client): Promise<void> => {
        await interaction.deferReply({ ephemeral: true });

        if (!watchClan.channel && client) {
            await watchClan.fetchChannel(client);
        }

        if (interaction.options.getSubcommand() === MAPPING.ADD.name) {
            await watchClan.addClanToWatch(interaction, MAPPING);
        } else if (interaction.options.getSubcommand() === MAPPING.REMOVE.name) {
            await watchClan.removeClanFromWatch(interaction, MAPPING);
        } else if (interaction.options.getSubcommand() === MAPPING.STATS.name) {
            await watchClan.clanStatistics(interaction, MAPPING);
        } else if (interaction.options.getSubcommand() === MAPPING.BLACKLIST_PLAYER.name) {
            await watchClan.addPlayerToBlacklist(interaction, MAPPING);
        } else if (interaction.options.getSubcommand() === MAPPING.UNBLACKLIST_PLAYER.name) {
            await watchClan.removePlayerToBlacklist(interaction, MAPPING);
        }
    },
    {
        option: [
            new SlashCommandSubcommandBuilder()
                .setName(MAPPING.ADD.name)
                .setDescription('Ajoute un clan à la liste des clans à observer.')
                .addStringOption((builder: SlashCommandStringOption) =>
                    builder.setName(MAPPING.ADD.optionsName[0]).setDescription("L'id du clan à observer").setRequired(true)
                )
                .addStringOption((builder: SlashCommandStringOption) =>
                    builder.setName(MAPPING.ADD.optionsName[1]).setDescription('Le nom du clan à observer').setRequired(true)
                ),
            new SlashCommandSubcommandBuilder()
                .setName(MAPPING.REMOVE.name)
                .setDescription('Supprime un clan de la liste des clans à observer')
                .addStringOption((builder: SlashCommandStringOption) =>
                    builder
                        .setName(MAPPING.REMOVE.optionsName[0])
                        .setDescription("L'id ou le nom du clan à supprimer")
                        .setRequired(true)
                        .setAutocomplete(true)
                ),
            new SlashCommandSubcommandBuilder()
                .setName(MAPPING.STATS.name)
                .setDescription("Consulte le nombre de départ d'un clan sur le mois")
                .addStringOption((builder: SlashCommandStringOption) =>
                    builder
                        .setName(MAPPING.STATS.optionsName[0])
                        .setDescription("L'id ou le nom du clan à supprimer")
                        .setRequired(true)
                        .setAutocomplete(true)
                ),
            new SlashCommandSubcommandBuilder()
                .setName(MAPPING.BLACKLIST_PLAYER.name)
                .setDescription('Ajoute un joueur à la liste noire pour le recrutement')
                .addStringOption((builder: SlashCommandStringOption) =>
                    builder.setName(MAPPING.BLACKLIST_PLAYER.optionsName[0]).setDescription('Le nom du joueur').setRequired(true)
                )
                .addStringOption((builder: SlashCommandStringOption) =>
                    builder
                        .setName(MAPPING.BLACKLIST_PLAYER.optionsName[1])
                        .setDescription('La raison de la mise en liste noire')
                        .setRequired(true)
                ),
            new SlashCommandSubcommandBuilder()
                .setName(MAPPING.UNBLACKLIST_PLAYER.name)
                .setDescription('Retire un joueur de la liste noire pour le recrutement')
                .addStringOption((builder: SlashCommandStringOption) =>
                    builder.setName(MAPPING.UNBLACKLIST_PLAYER.optionsName[0]).setDescription('Le nom du joueur').setRequired(true)
                ),
        ],
        permission: PermissionsBitField.Flags.KickMembers,
        autocomplete: async (interaction: AutocompleteInteraction): Promise<void> => await watchClan.autocomplete(interaction),
    }
);
