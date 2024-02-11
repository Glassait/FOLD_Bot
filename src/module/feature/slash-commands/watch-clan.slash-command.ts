import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    Client,
    Colors,
    CommandInteractionOption,
    EmbedBuilder,
    PermissionsBitField,
    SlashCommandSubcommandBuilder,
    TextChannel,
} from 'discord.js';
import { SlashCommandModel } from './model/slash-command.model';
import { SlashCommandStringOption } from '@discordjs/builders';
import { FeatureSingleton } from '../../shared/singleton/feature.singleton';
import { InventorySingleton } from '../../shared/singleton/inventory.singleton';
import { Logger } from '../../shared/classes/logger';
import { Context } from '../../shared/classes/context';
import { Clan } from '../../shared/types/feature.type';

const logger: Logger = new Logger(new Context('WATCH-CLAN-SLASH-COMMAND'));
const feature: FeatureSingleton = FeatureSingleton.instance;
const inventory: InventorySingleton = InventorySingleton.instance;
let channel: TextChannel;
const confirmationEmbed: EmbedBuilder = new EmbedBuilder().setColor(Colors.Green);
const MAPPING = {
    ADD: {
        name: 'add',
        optionsName: ['id', 'name'],
    },
    REMOVE: {
        name: 'remove',
        optionsName: ['id-ou-name'],
    },
};

export const command: SlashCommandModel = new SlashCommandModel(
    'watch-clan',
    'Observe des clans afin de détecté les joueurs qui partent',
    async (interaction: ChatInputCommandInteraction, client?: Client): Promise<void> => {
        await interaction.deferReply({ ephemeral: true });

        if (!channel && client) {
            channel = await inventory.getChannelForFoldRecruitment(client);
        }

        if (interaction.options.getSubcommand() === MAPPING.ADD.name) {
            const id: CommandInteractionOption = interaction.options.get(MAPPING.ADD.optionsName[0]) as CommandInteractionOption;
            const name: CommandInteractionOption = interaction.options.get(MAPPING.ADD.optionsName[1]) as CommandInteractionOption;

            const added = feature.addClan({ id: <string>id.value, name: <string>name.value });

            if (!added) {
                logger.info(`Clan ${id.value} already exists`);
                await interaction.editReply({ content: 'Le clan existe déjà !' });

                return;
            }

            inventory.updateLastCheckForClan(<string>id.value, new Date().toISOString());

            logger.info(`Clan \`${id.value} ${name.value}\` added to the clan to watch`);
            await interaction.editReply({
                content: 'Le clan a bien été ajouté ! Le clan sera observé à partir de demain (*^▽^*)',
            });

            confirmationEmbed
                .setTitle("Ajout de clan à l'observateur")
                .setDescription(`Le clan \`${name.value}\` a été ajouté à la liste des clans à observer !`);

            await channel.send({
                embeds: [confirmationEmbed],
            });
        } else if (interaction.options.getSubcommand() === MAPPING.REMOVE.name) {
            const idOrName: CommandInteractionOption = interaction.options.get(MAPPING.REMOVE.optionsName[0]) as CommandInteractionOption;

            const removed: Clan[] = feature.removeClan(<string>idOrName.value);

            if (removed.length <= 0) {
                logger.info(`Clan ${idOrName.value} doesn't exist in the clan to watch`);
                await interaction.editReply({ content: "Le clan n'existe pas et donc ne peux pas être supprimé !" });
                return;
            }

            inventory.deleteClan(removed[0].id);

            logger.info(`Clan \`${removed[0].id} ${removed[0].name}\` removed from the clan to watch`);
            await interaction.editReply({ content: 'Le clan a bien été supprimé !' });

            confirmationEmbed
                .setTitle("Suppression de clan de l'observateur")
                .setDescription(`Le clan \`${removed[0].name}\` a été supprimé de la liste des clans à observer !`);

            await channel.send({
                embeds: [confirmationEmbed],
            });
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
                        .setDescription("L'id ou name du clan à supprimer")
                        .setRequired(true)
                        .setAutocomplete(true)
                ),
        ],
        permission: PermissionsBitField.Flags.KickMembers,
        autocomplete: async (interaction: AutocompleteInteraction): Promise<void> => {
            const focusedOption = interaction.options.getFocused(true);

            const filtered = feature.clans.filter(
                (clan: Clan) => clan.id.includes(focusedOption.value) || clan.name.includes(focusedOption.value)
            );

            await interaction.respond(
                filtered
                    .map((clan: Clan): { name: string; value: string } => ({ name: `${clan.name} | ${clan.id}`, value: clan.name }))
                    .slice(0, 24)
            );
        },
    }
);
