import { ChatInputCommandInteraction, CommandInteractionOption, PermissionsBitField, SlashCommandSubcommandBuilder } from 'discord.js';
import { SlashCommandModel } from './model/slash-command.model';
import { SlashCommandStringOption } from '@discordjs/builders';
import { FeatureSingleton } from '../../shared/singleton/feature.singleton';
import { InventorySingleton } from '../../shared/singleton/inventory.singleton';
import { Logger } from '../../shared/classes/logger';
import { Context } from '../../shared/classes/context';

const logger: Logger = new Logger(new Context('WATCH-CLAN-SLASH-COMMAND'));
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
            if (added) {
                inventory.updateLastClan(<string>id.value, new Date().toISOString());

                logger.info(`Clan ${id.value} added to the clan to watch`);
                await interaction.editReply({
                    content: 'Le clan a bien été ajouté ! Le clan sera observé à partir de demain (*^▽^*)',
                });
                return;
            }

            logger.info(`Clan ${id.value} already exists`);
            await interaction.editReply({ content: 'Le clan existe déjà !' });
        } else if (id) {
            const removed = feature.removeClan(<string>id.value);
            if (removed) {
                inventory.deleteClan(<string>id.value);

                logger.info(`Clan ${id.value}/ removed from the clan to watch`);
                await interaction.editReply({ content: 'Le clan a bien été supprimé !' });
                return;
            }

            logger.info(`Clan ${id.value} doesn't exist in the clan to watch`);
            await interaction.editReply({ content: "Le clan n'existe pas et donc ne peux pas être supprimé !" });
        }
    },
    [
        new SlashCommandSubcommandBuilder()
            .setName('add')
            .setDescription('Ajoute un clan à la liste des clans à observer.')
            .addStringOption((builder: SlashCommandStringOption) =>
                builder.setName('id').setDescription("L'id du clan à observer").setRequired(true)
            )
            .addStringOption((builder: SlashCommandStringOption) =>
                builder.setName('name').setDescription('Le nom du clan à observer').setRequired(true)
            ),
        new SlashCommandSubcommandBuilder()
            .setName('remove')
            .setDescription('Supprime un clan de la liste des clans à observer')
            .addStringOption((builder: SlashCommandStringOption) =>
                builder.setName('id-ou-name').setDescription("L'id ou name du clan à supprimer").setRequired(true)
            ),
    ],
    PermissionsBitField.Flags.KickMembers
);
