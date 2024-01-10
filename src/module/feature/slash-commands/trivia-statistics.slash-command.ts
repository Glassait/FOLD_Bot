import {
    ActionRowBuilder,
    BooleanCache,
    CacheType,
    ChatInputCommandInteraction,
    Colors,
    ComponentType,
    EmbedBuilder,
    Message,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    StringSelectMenuOptionBuilder,
} from 'discord.js';
import { SlashCommandModel } from './model/slash-command.model';
import { StatisticSingleton } from '../../shared/singleton/statistic.singleton';
import { TimeEnum } from '../../shared/enums/time.enum';

const statistic: StatisticSingleton = StatisticSingleton.instance;

export const command: SlashCommandModel = new SlashCommandModel(
    'trivia-statistics',
    'Affiche les statistiques pour le jeu Trivia',
    async (interaction: ChatInputCommandInteraction): Promise<void> => {
        await interaction.deferReply({ ephemeral: true });

        const playerStats = statistic.getPlayerStatistic(interaction.user.username);

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
                    .setTitle(`Statistiques pour le mois ${i.values[0]}`)
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
            });
    }
);
