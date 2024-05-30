import {
    ActionRowBuilder,
    type BooleanCache,
    type CacheType,
    ChatInputCommandInteraction,
    Colors,
    ComponentType,
    EmbedBuilder,
    type Message,
    StringSelectMenuBuilder,
    type StringSelectMenuInteraction,
    StringSelectMenuOptionBuilder,
} from 'discord.js';
import type { TriviaPlayer } from '../../../shared/tables/complexe-table/players/models/players.type';
import type { TriviaAnswer } from '../../../shared/tables/complexe-table/players-answers/models/players-answers.type';
import { TimeEnum } from '../../../shared/enums/time.enum';
import type { WinStreak } from '../../../shared/tables/complexe-table/win-streak/models/win-streak.type';
import { getCurrentMonth } from '../../../shared/utils/date.util';
import { MEDAL } from '../../../shared/utils/variables.util';
import { TriviaExampleModel } from './trivia-example.model';
import { Table } from '../../../shared/decorators/injector/table-injector.decorator';
import type { PlayersTable } from '../../../shared/tables/complexe-table/players/players.table';
import type { PlayersAnswersTable } from '../../../shared/tables/complexe-table/players-answers/players-answers.table';
import type { WinStreakTable } from '../../../shared/tables/complexe-table/win-streak/win-streak.table';
import type { Logger } from '../../../shared/utils/logger';
import { Singleton } from '../../../shared/decorators/injector/singleton-injector.decorator';
import type { TriviaSingleton } from '../../../shared/singleton/trivia/trivia.singleton';
import type { TriviaDataTable } from '../../../shared/tables/complexe-table/trivia-data/trivia-data.table';

export class TriviaStatisticsModel extends TriviaExampleModel {
    //region INJECTION
    protected readonly logger: Logger;
    @Singleton('Trivia') protected readonly trivia: TriviaSingleton;
    @Table('TriviaData') protected readonly triviaTable: TriviaDataTable;
    @Table('Players') protected readonly playersTable: PlayersTable;
    @Table('PlayersAnswer') protected readonly playerAnswerTable: PlayersAnswersTable;
    @Table('WinStreak') protected readonly winStreakTable: WinStreakTable;
    //endregion

    /**
     * Sends the trivia statistics for a specific month to the user.
     *
     * @param {ChatInputCommandInteraction} interaction - The interaction object representing the user command.
     */
    public async sendStatistics(interaction: ChatInputCommandInteraction): Promise<void> {
        const player: TriviaPlayer | undefined = await this.playersTable.getPlayerByName(interaction.user.username);

        if (!player) {
            await interaction.editReply({
                content: "Tu n'as pas encore joué à Trivia. Essaye après avoir répondu au moins une fois au jeu. (`/trivia game`)",
            });
            return;
        }

        const lastAnswer: TriviaAnswer | undefined = await this.playerAnswerTable.getLastAnswerOfPlayer(player.id);

        if (!lastAnswer) {
            await interaction.editReply({
                content:
                    "Tu n'as pas encore de statistiques pour le jeu Trivia. Essaye après avoir répondu au moins une fois au jeu. (`/trivia game`)",
            });
            return;
        }

        const periods: Date[] = (await this.playerAnswerTable.getAllPeriodsOfPlayer(player.id))
            .map(({ month, year }) => {
                const date = new Date();

                date.setMonth(month - 1);
                date.setFullYear(year);

                return date;
            })
            .reverse();

        const select: StringSelectMenuBuilder = new StringSelectMenuBuilder()
            .setCustomId('trivia-statistics-select')
            .setPlaceholder('Choisissez un mois');

        periods.forEach((date: Date) =>
            select.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }))
                    .setValue(date.toISOString())
            )
        );

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
        const message: Message<BooleanCache<CacheType>> = await interaction.editReply({
            components: [row],
            content: 'Choisissez un mois pour voir les statistiques.',
        });

        message
            .createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: TimeEnum.HOUR })

            .on('collect', async (i: StringSelectMenuInteraction): Promise<void> => {
                const date = new Date(i.values[0]);

                const stats: TriviaAnswer[] = await this.playerAnswerTable.getPeriodAnswerOfPlayer(player.id, date);
                const winStreak: WinStreak = await this.winStreakTable.getWinStreakFromDate(player.id, date);

                const embed = new EmbedBuilder()
                    .setTitle(
                        `Statistiques pour le mois de ${date.toLocaleDateString('fr-FR', {
                            month: 'long',
                            year: 'numeric',
                        })}`
                    )
                    .setColor(Colors.LuminousVividPink)
                    .setDescription('Voici les statistiques demandées')
                    .setFields(
                        { name: 'Elo', value: `\`${stats[stats.length - 1].elo}\``, inline: true },
                        {
                            name: 'Nombre de bonnes réponses',
                            value: `\`${stats.reduce((number: number, { right_answer }) => number + (right_answer ? 1 : 0), 0)}\``,
                            inline: true,
                        },
                        { name: 'Plus longue séquence correcte', value: `\`${winStreak.max}\`` },
                        {
                            name: 'Réponse la plus rapide',
                            value: `\`${Math.min(...stats.filter(({ answer_time }): boolean => answer_time !== null).flatMap(({ answer_time }): number => answer_time!)) / TimeEnum.SECONDE}\` sec`,
                            inline: true,
                        },
                        {
                            name: 'Réponse la plus longue',
                            value: `\`${Math.max(...stats.filter(({ answer_time }): boolean => answer_time !== null).flatMap(({ answer_time }): number => answer_time!)) / TimeEnum.SECONDE}\` sec`,
                            inline: true,
                        },
                        {
                            name: 'Nombre de participation',
                            value: `\`${stats.filter(({ trivia_id }) => trivia_id !== null).length}\``,
                        }
                    );

                await i.update({
                    embeds: [embed],
                });
            });
    }

    /**
     * Sends the scoreboard for the current month's trivia game.
     *
     * @param {ChatInputCommandInteraction} interaction - The interaction object representing the user's command interaction.
     *
     * Update here with database
     */
    public async sendScoreboard(interaction: ChatInputCommandInteraction): Promise<void> {
        const username = interaction.user.username;
        const embedScoreboard = new EmbedBuilder()
            .setTitle('Scoreboard')
            .setDescription(`Voici le scoreboard du mois de \`${getCurrentMonth()}\` pour le jeu trivia`)
            .setFooter({ text: 'Trivia game' })
            .setColor(Colors.Fuchsia);

        const players: TriviaPlayer[] = await this.playersTable.getAllPlayers();

        if (players.length === 0) {
            await interaction.editReply({
                content: "Aucun joueur n'a pour l'instant joué au jeu",
            });
            return;
        }

        const promises: Promise<(TriviaAnswer & TriviaPlayer) | null>[] = players.map(({ id }) =>
            this.playerAnswerTable.getLastAnswerWithPlayerOfPlayer(id)
        );

        let playerStats = (await Promise.all(promises)).filter(
            (value: (TriviaAnswer & TriviaPlayer) | null): boolean => value !== null
        ) as Awaited<TriviaAnswer & TriviaPlayer>[];

        const today = new Date();
        playerStats = playerStats.filter(({ date }) => date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear());

        if (playerStats.length === 0) {
            await interaction.editReply({
                content: "Aucun joueur n'a pour l'instant joué ce mois si au jeu",
            });
            return;
        }

        playerStats.sort((a: TriviaAnswer & TriviaPlayer, b: TriviaAnswer & TriviaPlayer) => b.elo - a.elo);

        embedScoreboard.addFields({
            name: 'Joueur - Elo',
            value: playerStats
                .map(
                    (player: TriviaAnswer & TriviaPlayer, index: number): string =>
                        `${username === player.name ? '`--> ' : ''}${index < 3 ? MEDAL[index] : index + 1}. ${player.name} - ${player.elo}${username === player.name ? ' <--`' : ''}`
                )
                .join('\n'),
            inline: true,
        });

        await interaction.editReply({
            embeds: [embedScoreboard],
        });
    }
}
