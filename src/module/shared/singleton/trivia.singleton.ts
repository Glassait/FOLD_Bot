import { type Client, Colors, EmbedBuilder, type TextChannel } from 'discord.js';
import { basename } from 'node:path';
import { application_id_wot } from '../../core/config.json';
import { ShellEnum, ShellType } from '../../feature/slash-commands/enums/shell.enum';
import type { WotApiModel } from '../apis/wot-api.model';
import { Logger } from '../classes/logger';
import { TimeEnum } from '../enums/time.enum';
import { WotApiConstants } from '../enums/wot-api.enum';
import type { Trivia } from '../types/inventory.type';
import type { TriviaPlayerStatistic, TriviaStatistic } from '../types/statistic.type';
import type { TriviaSelected } from '../types/trivia.type';
import type { TankopediaVehiclesSuccess, VehicleData } from '../types/wot-api.type';
import { DateUtil } from '../utils/date.util';
import { RandomUtil } from '../utils/random.util';
import { MEDAL } from '../utils/variables.util';
import { InventorySingleton } from './inventory.singleton';
import { StatisticSingleton } from './statistic.singleton';

/**
 * Class used to manage the trivia game
 * This class implement the Singleton pattern
 */
export class TriviaSingleton {
    //region INJECTION
    private readonly logger: Logger;
    private readonly wotApi: WotApiModel;
    private readonly inventory: InventorySingleton;
    private readonly statistic: StatisticSingleton;
    //endregion

    //region PRIVATE READONLY FIELDS
    /**
     * Contains all the daily tanks for the trivia game.
     *
     * @length 4
     * @sub-length 4
     */
    private readonly _allTanks: VehicleData[][];
    /**
     * Contains all the selected tanks for the trivia game.
     *
     * @length 4
     */
    private readonly _datum: TriviaSelected[];
    /**
     * The information stored in the inventory about the trivia game
     */
    private readonly trivia: Trivia;
    /**
     * The information stored in the statistique about the trivia game
     */
    private readonly triviaStatistique: TriviaStatistic;
    //endregion

    //region PRIVATE FIELDS
    private channel: TextChannel;
    //endregion

    private constructor() {
        const api = require('../apis/wot-api.model').WotApiModel;

        this.wotApi = new api();
        this.inventory = InventorySingleton.instance;
        this.logger = new Logger(basename(__filename));
        this.statistic = StatisticSingleton.instance;

        this.trivia = this.inventory.trivia;
        this.triviaStatistique = this.statistic.trivia;

        this._allTanks = [];
        this._datum = [];
    }

    //region SINGLETON
    private static _instance: TriviaSingleton;

    static get instance(): TriviaSingleton {
        if (!this._instance) {
            this._instance = new TriviaSingleton();
            this._instance.logger.info('{} instance initialized', 'Trivia');
        }

        return this._instance;
    }
    //endregion

    //region GETTER-SETTER
    get datum(): TriviaSelected[] {
        return this._datum;
    }

    get allTanks(): VehicleData[][] {
        return this._allTanks;
    }
    //endregion

    /**
     * Fetches tank of the day for the trivia game.
     */
    public async fetchTankOfTheDay(): Promise<void> {
        this.statistic.initializeMonthStatistics();

        if (this.triviaStatistique.overall[this.statistic.currentMonth].day_tank[this.statistic.currentDay]) {
            this.logger.debug('Trivia tanks already fetch, cannot fetch new tanks !');
            return;
        }

        for (let i = 0; i < this.trivia.max_number_of_question; i++) {
            this.logger.debug(`Start fetching tanks n°${i}`);
            const tankPages: number[] = this.fetchTankPages();

            const tankopediaResponses: TankopediaVehiclesSuccess[] = await this.fetchTankopediaResponses(tankPages);

            if (tankopediaResponses[0].meta.count !== this.trivia.total_number_of_tanks) {
                this.trivia.total_number_of_tanks = tankopediaResponses[0].meta.page_total;
            }

            this._allTanks.push(this.extractTankData(tankopediaResponses));

            this._datum.push({
                tank: this._allTanks[i][RandomUtil.getRandomNumber(this._allTanks.length - 1)],
                ammoIndex: RandomUtil.getRandomNumber(),
            });

            this.logger.info(
                `Tank for game selected for question n°${i} : {}, the ammo type is : {}`,
                this._datum[i].tank.name,
                this._datum[i].ammoIndex ? ShellType.GOLD : ShellType.NORMAL
            );
        }

        this.triviaStatistique.overall[this.statistic.currentMonth].day_tank[this.statistic.currentDay] = this._datum;
        this.triviaStatistique.overall[this.statistic.currentMonth].number_of_game += this._datum.length;

        this.statistic.trivia = this.triviaStatistique;
        this.inventory.trivia = this.trivia;
    }

    public async sendTriviaResultForYesterday(client: Client): Promise<void> {
        this.logger.debug('Start collecting data to send the trivia result');
        this.channel = await this.inventory.getChannelForTrivia(client);

        const previousDay = DateUtil.getPreviousDay();
        const dayTankElement = this.triviaStatistique.overall[this.statistic.currentMonth].day_tank[previousDay];

        if (!dayTankElement) {
            this.logger.debug('No tanks fetch yesterday ! Not sending result');
            return;
        }

        let dayWithoutParticipation: boolean = true;

        for (const selected of dayTankElement) {
            const index: number = dayTankElement.indexOf(selected);

            const player: [string, TriviaPlayerStatistic][] = Object.entries(this.triviaStatistique.player)
                .filter((value: [string, TriviaPlayerStatistic]): boolean => {
                    return value[1][this.statistic.currentMonth].daily[previousDay]?.answer[index] === selected.tank.name;
                })
                .sort((a: [string, TriviaPlayerStatistic], b: [string, TriviaPlayerStatistic]) => {
                    return (
                        a[1][this.statistic.currentMonth].daily[previousDay].answer_time[index] -
                        b[1][this.statistic.currentMonth].daily[previousDay].answer_time[index]
                    );
                })
                .slice(0, 3);

            if (player.length > 0) {
                dayWithoutParticipation = false;
            }

            const answerEmbed = new EmbedBuilder()
                .setTitle(`Question n°${index + 1}`)
                .setColor(Colors.DarkGold)
                .setImage(selected.tank.images.big_icon)
                .setDescription(`Le char à deviner était : \`${selected.tank.name}\``)
                .setFooter({ text: 'Trivia Game' })
                .setFields(
                    {
                        name: 'Obus normal',
                        value: `\`${ShellEnum[selected.tank.default_profile.ammo[0].type as keyof typeof ShellEnum]} ${
                            selected.tank.default_profile.ammo[0].damage[1]
                        }\``,
                        inline: true,
                    },
                    {
                        name: 'Obus spécial (ou gold)',
                        value: `\`${ShellEnum[selected.tank.default_profile.ammo[1].type as keyof typeof ShellEnum]} ${
                            selected.tank.default_profile.ammo[1].damage[1]
                        }\``,
                        inline: true,
                    },
                    {
                        name: 'Obus explosif',
                        value: `\`${ShellEnum[selected.tank.default_profile.ammo[2].type as keyof typeof ShellEnum]} ${
                            selected.tank.default_profile.ammo[2].damage[1]
                        }\``,
                        inline: true,
                    }
                );

            const playerEmbed = new EmbedBuilder()
                .setTitle(':trophy: Podium des joueurs :trophy: ')
                .setColor(Colors.DarkGold)
                .setFooter({ text: 'Trivia Game' });

            if (player.length === 0) {
                this.logger.debug('No players answer to the question n°{}', String(index + 1));
                playerEmbed.setDescription("Aucun joueur n'a envoyé de réponse ou répondu correctement à cette question");
            } else {
                playerEmbed.setFields({
                    name: 'Top 3',
                    value: player.reduce(
                        (previousValue: string, currentValue: [string, TriviaPlayerStatistic], currentIndex: number): string => {
                            this.logger.debug(
                                'The following player {} is in the top 3 for the question n°{}',
                                currentValue[0],
                                String(index + 1)
                            );

                            return `${previousValue}\n${MEDAL[currentIndex]}\`${currentValue[0]}\` en ${this.calculateResponseTime(
                                currentValue,
                                index
                            )}`;
                        },
                        ''
                    ),
                });
            }

            this.logger.debug('Sending message in channel for question n°{}', String(index + 1));
            await this.channel.send({
                embeds: [answerEmbed, playerEmbed],
            });
        }

        this.triviaStatistique.overall[this.statistic.currentMonth].day_without_participation += dayWithoutParticipation ? 1 : 0;
        this.statistic.trivia = this.triviaStatistique;
    }

    /**
     * Reduces the Elo of inactive players for the previous day.
     * Inactive players are those who did not participate in the trivia game on the previous day.
     * The Elo reduction factor is 1.8%.
     */
    public async reduceEloOfInactifPlayer(): Promise<void> {
        if (!this.triviaStatistique.overall[this.statistic.currentMonth].day_tank[DateUtil.getPreviousDay()]) {
            this.logger.debug('No tanks fetch yesterday ! Not reducing elo of inactif player');
            return;
        }

        this.logger.debug('Start removing elo of inactif player');
        const yesterday: Date = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const embedPlayer: EmbedBuilder = new EmbedBuilder()
            .setTitle('Joueur inactif')
            .setColor(Colors.DarkGold)
            .setDescription('Voici la liste des joueurs inactifs qui ont perdu des points');

        for (const [username, playerStats] of Object.entries(this.triviaStatistique.player)) {
            if (!playerStats[DateUtil.convertDateToMonthYearString(yesterday)].daily[DateUtil.convertDateToDayMonthYearString(yesterday)]) {
                const oldElo: number = this.triviaStatistique.player[username][DateUtil.convertDateToMonthYearString(yesterday)].elo;
                this.triviaStatistique.player[username][DateUtil.convertDateToMonthYearString(yesterday)].elo *= 0.982;
                this.triviaStatistique.player[username][DateUtil.convertDateToMonthYearString(yesterday)].elo = Math.round(
                    this.triviaStatistique.player[username][DateUtil.convertDateToMonthYearString(yesterday)].elo
                );
                this.logger.debug(
                    'Inactif player spotted : {}, old elo : {}, new elo : {}',
                    username,
                    String(oldElo),
                    String(this.triviaStatistique.player[username][DateUtil.convertDateToMonthYearString(yesterday)].elo)
                );
                embedPlayer.addFields({
                    name: username,
                    value: `Diminution de \`${
                        oldElo - this.triviaStatistique.player[username][DateUtil.convertDateToMonthYearString(yesterday)].elo
                    }\` d'élo`,
                    inline: true,
                });
            }
        }

        await this.channel.send({ embeds: [embedPlayer] });
        this.statistic.trivia = this.triviaStatistique;
    }

    /**
     * Calculates the time taken by the player to answer the trivia question.
     *
     * @param {[string, TriviaPlayerStatistic]} playersResponse - Array of player username and their responses.
     * @param {number} index - The index of the question
     *
     * @returns {string} The time taken by the player to answer the trivia question in string format.
     *
     * @example
     * const playersResponse = ['glassait', { 'mars 2024': { daily: { '30/02/24': { answer_time: [3000] } } } }]
     * const time = this.calculateResponseTime(playersResponse, 0)
     * console.log(time) // 3 secondes
     */
    private calculateResponseTime(playersResponse: [string, TriviaPlayerStatistic], index: number): string {
        const sec = playersResponse[1][this.statistic.currentMonth].daily[DateUtil.getPreviousDay()].answer_time[index] / TimeEnum.SECONDE;
        return sec > 60 ? `${Math.floor(sec / 60)}:${Math.round(sec % 60)} minutes` : `${sec.toFixed(2)} secondes`;
    }

    /**
     * Fetches tank pages for tank of the day.
     *
     * @returns {number[]} Array of tank pages to fetch.
     */
    private fetchTankPages(): number[] {
        const tankPages: number[] = RandomUtil.getArrayWithRandomNumber(
            4,
            this.trivia.total_number_of_tanks,
            1,
            false,
            this.trivia.last_tank_page
        );

        this.trivia.last_tank_page = [
            ...this.trivia.last_tank_page.slice(this.trivia.last_tank_page.length >= this.trivia.max_number_of_unique_tanks ? 4 : 0),
            ...tankPages,
        ];
        return tankPages;
    }

    /**
     * Fetches tankopedia responses for the given tank pages.
     *
     * @param {number[]} tankPages - Array of tank pages to fetch.
     *
     * @returns {Promise<TankopediaVehiclesSuccess[]>} A Promise that resolves with an array of tankopedia responses.
     */
    private async fetchTankopediaResponses(tankPages: number[]): Promise<TankopediaVehiclesSuccess[]> {
        const responses: TankopediaVehiclesSuccess[] = [];
        for (const page of tankPages) {
            responses.push(
                await this.wotApi.fetchTankopediaApi(
                    this.trivia.url.replace('pageNumber', String(page)).replace(WotApiConstants.APPLICATION_ID, application_id_wot)
                )
            );
        }
        return responses;
    }

    /**
     * Extracts tank data from tankopedia responses.
     *
     * @param {TankopediaVehiclesSuccess[]} responses - Array of tankopedia responses.
     *
     * @returns {VehicleData[]} Array of tank data.
     */
    private extractTankData(responses: TankopediaVehiclesSuccess[]): VehicleData[] {
        return responses.flatMap((response: TankopediaVehiclesSuccess) => Object.values(response.data)[0]);
    }
}
