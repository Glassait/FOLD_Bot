import { ChatInputCommandInteraction, CommandInteractionOption, PermissionsBitField, SlashCommandSubcommandBuilder } from 'discord.js';
import { SlashCommandModel } from './model/slash-command.model';
import { SlashCommandStringOption } from '@discordjs/builders';
import { FeatureSingleton } from '../../shared/singleton/feature.singleton';
import { InventorySingleton } from '../../shared/singleton/inventory.singleton';
import { Clan } from '../../shared/types/feature.type';
import { Logger } from '../../shared/classes/logger';
import { Context } from '../../shared/classes/context';

const logger: Logger = new Logger(new Context('NAME-SLASH-COMMAND'));
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

            logger.info(added ? `Clan ${id.value} added to the clan to watch` : `Clan ${id.value} already exists`);
            await interaction.editReply({
                content: added ? 'Le clan a bien été ajouté ! Le clan sera observé a partir de demain :)' : 'Le clan existe déjà',
            });
        } else if (id) {
            feature.removeClan(<string>id.value);
            inventory.deleteClan(<string>id.value);

            logger.info(`Clan ${id.value} removed from the clan to watch`);
            await interaction.editReply({ content: 'Le clan a bien été supprimé !' });
        } else {
            logger.info('Clan list displayed');
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
