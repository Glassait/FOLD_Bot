import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { SlashCommandModel } from './model/slash-command.model';
import { StatisticSingleton } from '../../shared/singleton/statistic.singleton';
import { TriviaModel } from './model/trivia.model';
import { InventorySingleton } from '../../shared/singleton/inventory.singleton';

const statistic: StatisticSingleton = StatisticSingleton.instance;

const MAPPING = {
    STATISTICS: {
        name: 'statistics',
    },
    GAME: {
        name: 'game',
    },
    RULE: {
        name: 'rule',
    },
};
const trivia = new TriviaModel();

export const command: SlashCommandModel = new SlashCommandModel(
    'trivia',
    'Commande concernant le jeu trivia',
    async (interaction: ChatInputCommandInteraction): Promise<void> => {
        await interaction.deferReply({ ephemeral: true });

        if (!InventorySingleton.instance.getFeatureFlipping('trivia')) {
            await interaction.editReply({
                content: "Le jeu trivia n'est pas activé par l'administrateur du bot.",
            });
            return;
        }

        if (interaction.options.getSubcommand() === MAPPING.STATISTICS.name) {
            // await watchClan.addClanToWatch(interaction, MAPPING);
        } else if (interaction.options.getSubcommand() === MAPPING.GAME.name) {
            await trivia.sendGame(interaction);
        } else if (interaction.options.getSubcommand() === MAPPING.RULE.name) {
            await trivia.sendRule(interaction);
        }
        /*const playerStats = statistic.getPlayerStatistic(interaction.user.username);

        if (!playerStats) {
            await interaction.editReply({
                content: "Tu n'as pas encore de statistiques pour le jeu Trivia. Essaye après avoir répondu au moins une fois au jeu.",
            });
        }

        const select: StringSelectMenuBuilder = new StringSelectMenuBuilder()
            .setCustomId('trivia-statistics-select')
            .setPlaceholder('Choisissez un mois');

        Object.keys(playerStats)
            .reverse()
            .forEach((month: string) => select.addOptions(new StringSelectMenuOptionBuilder().setLabel(month).setValue(month)));

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
        const message: Message<BooleanCache<CacheType>> = await interaction.editReply({
            components: [row],
            content: 'Choisissez un mois pour voir les statistiques.',
        });

        message
            .createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: TimeEnum.HOUR * 2 })
            .on('collect', async (i: StringSelectMenuInteraction): Promise<void> => {
                const stats = playerStats[i.values[0]];

                const embed = new EmbedBuilder()
                    .setTitle(`Statistiques pour le mois de ${i.values[0]}`)
                    .setColor(Colors.LuminousVividPink)
                    .setDescription('Voici les statistiques demandées')
                    .setFields(
                        { name: 'Elo', value: `\`${stats.elo}\``, inline: true },
                        { name: 'Nombre de bonnes réponses', value: `\`${stats.right_answer}\``, inline: true },
                        { name: 'Plus longue séquence correcte', value: `\`${(stats.win_strick as { max: number }).max}\`` },
                        {
                            name: 'Réponse la plus rapide',
                            value: `\`${Math.min(...stats.answer_time) / TimeEnum.SECONDE}\` sec`,
                            inline: true,
                        },
                        {
                            name: 'Réponse la plus longue',
                            value: `\`${Math.max(...stats.answer_time) / TimeEnum.SECONDE}\` sec`,
                            inline: true,
                        },
                        { name: 'Nombre de participation', value: `\`${stats.participation}\`` }
                    );

                await i.update({
                    embeds: [embed],
                });
            });*/
    },
    {
        option: [
            new SlashCommandSubcommandBuilder()
                .setName(MAPPING.GAME.name)
                .setDescription('Jouer au jeu trivia et apprenez les alpha des tier 10 (max 4 par jours)'),
            new SlashCommandSubcommandBuilder()
                .setName(MAPPING.STATISTICS.name)
                .setDescription('Visualiser-vos statistiques sur le jeu trivia'),
            new SlashCommandSubcommandBuilder().setName(MAPPING.RULE.name).setDescription('Lire les règle du jeu trivia'),
        ],
    }
);
