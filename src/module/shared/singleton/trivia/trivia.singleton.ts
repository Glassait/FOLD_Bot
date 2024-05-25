import { type Client, Colors, EmbedBuilder, type TextChannel } from 'discord.js';
import { basename } from 'node:path';
import { ShellEnum, ShellType } from '../../../feature/slash-commands/enums/shell.enum';
import type { TankopediaVehiclesSuccess, VehicleData } from '../../apis/wot-api/models/wot-api.type';
import type { WotApiModel } from '../../apis/wot-api/wot-api.model';
import { EmojiEnum } from '../../enums/emoji.enum';
import { TimeEnum } from '../../enums/time.enum';
import { ChannelsTable } from '../../tables/complexe-table/channels/channels.table';
import type { TriviaAnswer } from '../../tables/complexe-table/players-answers/models/players-answers.type';
import { PlayersAnswersTable } from '../../tables/complexe-table/players-answers/players-answers.table';
import type { TriviaPlayer } from '../../tables/complexe-table/players/models/players.type';
import { PlayersTable } from '../../tables/complexe-table/players/players.table';
import type { Tank } from '../../tables/complexe-table/tanks/models/tanks.type';
import { TanksTable } from '../../tables/complexe-table/tanks/tanks.table';
import type { TriviaData } from '../../tables/complexe-table/trivia-data/models/trivia-data.type';
import { TriviaDataTable } from '../../tables/complexe-table/trivia-data/trivia-data.table';
import type { TriviaQuestion } from '../../tables/complexe-table/trivia/models/trivia.type';
import { TriviaTable } from '../../tables/complexe-table/trivia/trivia.table';
import { DateUtil } from '../../utils/date.util';
import { EnvUtil } from '../../utils/env.util';
import { Logger } from '../../utils/logger';
import { RandomUtil } from '../../utils/random.util';
import { StringUtil } from '../../utils/string.util';
import { UserUtil } from '../../utils/user.util';
import { MEDAL } from '../../utils/variables.util';
import type { TriviaSelected } from './models/trivia.type';

/**
 * Class used to manage the trivia game
 * This class implement the Singleton pattern
 */
export class TriviaSingleton {
    //region INJECTION
    private readonly logger: Logger;
    private readonly wotApi: WotApiModel;
    private readonly channels: ChannelsTable;
    private readonly triviaDataTable: TriviaDataTable;
    private readonly tanksTable: TanksTable;
    private readonly triviaTable: TriviaTable;
    private readonly playerAnswerTable: PlayersAnswersTable;
    private readonly playerTable: PlayersTable;
    //endregion

    //region PRIVATE READONLY FIELDS
    /**
     * Contains all the daily tanks for the trivia game.
     *
     * @length 4
     * @sub-length 4
     */
    private readonly _allTanks: Tank[][];

    /**
     * Contains all the selected tanks for the trivia game.
     *
     * @length 4
     */
    private readonly _selectedTanks: TriviaSelected[];
    //endregion

    //region PRIVATE FIELDS
    /**
     * The channel to send the yesterday result
     */
    private channel: TextChannel;

    /**
     * @see TriviaData.max_number_of_question
     */
    private maxNumberOfQuestion: TriviaData['max_number_of_question'];

    /**
     * The total number of tanks store in the database.
     *
     * Used to randomise the tank selected.
     */
    private totalNumberOfTanks: number;

    /**
     * @see TriviaData.last_tank_page
     */
    private lastTankPage: TriviaData['last_tank_page'];

    /**
     * @see TriviaData.max_number_of_unique_tanks
     */
    private maxNumberOfUniqueTanks: TriviaData['max_number_of_unique_tanks'];

    //endregion

    private constructor() {
        this.wotApi = new (require('../../apis/wot-api/wot-api.model').WotApiModel)();
        this.logger = new Logger(basename(__filename));
        this.channels = new ChannelsTable();
        this.triviaDataTable = new TriviaDataTable();
        this.tanksTable = new TanksTable();
        this.triviaTable = new TriviaTable();
        this.playerAnswerTable = new PlayersAnswersTable();
        this.playerTable = new PlayersTable();

        this._allTanks = [];
        this._selectedTanks = [];

        setTimeout(async (): Promise<void> => {
            this.maxNumberOfQuestion = await this.triviaDataTable.getMaxNumberOfQuestion();
            this.totalNumberOfTanks = await this.tanksTable.countAll();
            this.lastTankPage = await this.triviaDataTable.getLastTankPage();
            this.maxNumberOfUniqueTanks = await this.triviaDataTable.getMaxNumberOfUniqueTanks();
        });

        this.logger.info(`${EmojiEnum.HAMMER} {} instance initialized`, TriviaSingleton.name);

        this.createQuestionOfTheDay.bind(this);
    }

    //region SINGLETON
    private static _instance: TriviaSingleton;

    static get instance(): TriviaSingleton {
        if (!this._instance) {
            this._instance = new TriviaSingleton();
        }

        return this._instance;
    }
    //endregion

    //region GETTER-SETTER
    get selectedTanks(): TriviaSelected[] {
        return this._selectedTanks;
    }

    get allTanks(): Tank[][] {
        return this._allTanks;
    }
    //endregion

    /**
     * Create the question for the trivia game for the current day.
     *
     * If questions already exist for the day in the database, retrieves them.
     * Otherwise, generates new questions and stores them in the database
     */
    public async createQuestionOfTheDay(): Promise<void> {
        const questions: TriviaQuestion[] = await this.triviaTable.getTriviaFromDateWithTank(new Date());

        if (questions.length > 0) {
            this.logger.debug('Trivia questions already fetch, backing up from database');
            this.retrieveTanksFromDatabase(questions);
            return;
        }

        for (let i = 0; i < this.maxNumberOfQuestion; i++) {
            this.logger.debug(`Start fetching question n°${i}`);
            const tanks: Tank[] = await this.fetchTanksData(await this.createTankPages());
            const selectedTank: {
                tank: Tank;
                ammoIndex: number;
            } = {
                tank: tanks[RandomUtil.getRandomNumber(tanks.length - 1)],
                ammoIndex: RandomUtil.getRandomNumber(),
            };

            await this.storeQuestionInDatabase(tanks, selectedTank, i);
        }

        await EnvUtil.sleep(TimeEnum.SECONDE);
        await this.createQuestionOfTheDay();
    }

    public async canReduceElo() {
        const today = new Date();
        const reduceDate = await this.triviaDataTable.getLastReduceDate();

        return (
            today.getFullYear() !== reduceDate.getFullYear() ||
            today.getMonth() !== reduceDate.getMonth() ||
            today.getDate() !== reduceDate.getDate()
        );
    }

    /**
     * Sends the results of yesterday's trivia to the configured channel.
     *
     * @param {client} client - The Discord client instance.
     */
    public async sendTriviaResultForYesterday(client: Client): Promise<void> {
        this.logger.debug('Start collecting data to send the trivia result');
        this.channel = await UserUtil.fetchChannelFromClient(client, await this.channels.getTrivia());

        let questions: TriviaQuestion[] = await this.triviaTable.getTriviaFromDateWithTank(DateUtil.getPreviousDayAsDate());

        if (!questions.length) {
            this.logger.debug('No questions fetch yesterday ! Not sending result');
            return;
        }

        questions = questions.filter((question: TriviaQuestion): boolean => question.ammoIndex !== null);

        for (const question of questions) {
            const index: number = questions.indexOf(question);

            const triviaAnswers = await this.playerAnswerTable.getTopThreeForYesterday(question.id);

            const answerEmbed: EmbedBuilder = new EmbedBuilder()
                .setTitle(`Question n°${index + 1}`)
                .setColor(Colors.DarkGold)
                .setImage(question.tank.image)
                .setDescription(`Le char à deviner était : \`${question.tank.name}\``)
                .setFooter({ text: 'Trivia Game' })
                .setFields(
                    {
                        name: 'Obus normal',
                        value: `\`${ShellEnum[question.tank.ammo[0].type as keyof typeof ShellEnum]} ${question.tank.ammo[0].damage[1]}\``,
                        inline: true,
                    },
                    {
                        name: 'Obus spécial (ou gold)',
                        value: `\`${ShellEnum[question.tank.ammo[1].type as keyof typeof ShellEnum]} ${question.tank.ammo[1].damage[1]}\``,
                        inline: true,
                    },
                    {
                        name: 'Obus explosif',
                        value: `\`${ShellEnum[question.tank.ammo[2].type as keyof typeof ShellEnum]} ${question.tank.ammo[2].damage[1]}\``,
                        inline: true,
                    }
                );

            const playerEmbed: EmbedBuilder = new EmbedBuilder()
                .setTitle(':trophy: Podium des joueurs :trophy: ')
                .setColor(Colors.DarkGold)
                .setFooter({ text: 'Trivia Game' });

            if (triviaAnswers.length === 0) {
                this.logger.debug('No players answer to the question n°{}', index + 1);
                playerEmbed.setDescription("Aucun joueur n'a envoyé de réponse ou répondu correctement à cette question");
            } else {
                playerEmbed.setFields({
                    name: 'Top 3',
                    value: triviaAnswers
                        .map((player, index: number): string => {
                            this.logger.debug('The following player {} is in the top 3 for the question n°{}', player.name, index + 1);
                            return `${MEDAL[index]}\`${player.name}\` en ${this.calculateResponseTime(player.answer_time)}`;
                        })
                        .join('\n'),
                });
            }

            this.logger.debug('Sending message in channel for question n°{}', String(index + 1));
            await this.channel.send({ embeds: [answerEmbed, playerEmbed] });
        }
    }

    /**
     * Reduces the Elo points of inactive players who haven't answered trivia questions recently.
     *
     * If an inactive player is found, their Elo is reduced by a small percentage (currently 1.8%)
     */
    public async reduceEloOfInactifPlayer(): Promise<void> {
        const yesterday = DateUtil.getPreviousDayAsDate();
        const questions: TriviaQuestion[] = await this.triviaTable.getTriviaFromDateWithTank(yesterday);

        if (!questions.length) {
            this.logger.debug('No questions fetch yesterday, skipping Elo reduction !');
            return;
        }

        this.logger.debug('Start removing elo of inactif player');
        const players: TriviaPlayer[] = await this.playerTable.getAllPlayers();

        if (!players.length) {
            this.logger.warn('No players found for trivia !');
            return;
        }

        const inactivePlayers: { playerName: string; eloChange: number }[] = [];
        const today = new Date();

        for (const player of players) {
            const lastAnswer: TriviaAnswer = await this.playerAnswerTable.getLastAnswerOfPlayer(player.id);

            if (lastAnswer) {
                const oldElo: number = lastAnswer?.elo ?? 0;
                const daysInactive = DateUtil.diffOfDay(today, new Date(lastAnswer.date));

                if ((!lastAnswer?.trivia_id && oldElo > 0) || daysInactive > 1) {
                    const newElo: number = Math.round(oldElo * 0.982);
                    inactivePlayers.push({
                        playerName: player.name,
                        eloChange: oldElo - newElo,
                    });

                    await this.playerAnswerTable.addAfkAnswer(player.id, yesterday, newElo);

                    this.logger.debug('Inactif player spotted : {}, old elo : {}, new elo : {}', player.name, oldElo, newElo);
                }
            }
        }

        if (inactivePlayers.length) {
            const inactiveEmbed: EmbedBuilder = new EmbedBuilder()
                .setTitle('Joueur inactif')
                .setColor(Colors.DarkGold)
                .setDescription('Voici la liste des joueurs inactifs qui ont perdu des points');

            inactivePlayers.forEach(({ eloChange, playerName }) =>
                inactiveEmbed.addFields({
                    name: playerName,
                    value: StringUtil.transformToCode("Diminution de {} d'élo", eloChange),
                    inline: true,
                })
            );

            await this.channel.send({ embeds: [inactiveEmbed] });
        }
        await this.triviaDataTable.updateLastReduceDate(new Date());
        this.logger.debug('Finished reducing Elo of inactive players');
    }

    /**
     * Update the tanks table in the database with the data of the tankopedia (Wargaming api). Mostly used to get new tanks.
     */
    public async updateTanksTableFromWotApi(): Promise<void> {
        this.logger.info('Start updating the tanks database');

        const vehicles: VehicleData[] = this.extractTankData(await this.wotApi.fetchTankopediaApi());

        for (const vehicle of Object.values(vehicles)) {
            const tank: Tank | null = await this.tanksTable.getTankByName(vehicle.name);

            if (!tank) {
                try {
                    await this.tanksTable.insertTank(vehicle.name, vehicle.images.big_icon, vehicle.default_profile.ammo);
                    this.logger.debug('Successfully insert tank {} in database', vehicle.name);
                } catch (reason) {
                    this.logger.warn(`Failed to insert tank {} in database with reason {}`, vehicle.name, reason);
                }
            }
        }
    }

    /**
     * Calculates the time taken by the player to answer the trivia question.
     *
     * @param {number} answerTime - The answer time of the player.
     *
     * @returns {string} - The time taken by the player to answer the trivia question in string format.
     *
     * @example
     * const answerTime = 3000;
     * const time = this.calculateResponseTime(answerTime, 0);
     * console.log(time); // 3 secondes
     */
    private calculateResponseTime(answerTime: number): string {
        const sec = answerTime / TimeEnum.SECONDE;
        return sec > 60 ? `${Math.floor(sec / 60)}:${Math.round(sec % 60)} minutes` : `${sec.toFixed(2)} secondes`;
    }

    /**
     * Fetches tank pages for tank of the day.
     *
     * @returns {number[]} - Array of tank pages to fetch.
     */
    private async createTankPages(): Promise<number[]> {
        const tankPages: number[] = RandomUtil.getArrayWithRandomNumber(4, this.totalNumberOfTanks, 1, false, this.lastTankPage);

        this.lastTankPage = [...this.lastTankPage.slice(this.lastTankPage.length >= this.maxNumberOfUniqueTanks ? 4 : 0), ...tankPages];

        try {
            await this.triviaDataTable.updateLastTankPage(this.lastTankPage);
            this.logger.debug('Successfully update the array of tanks already selected');
        } catch (reason) {
            this.logger.warn('Failed to update the array of last tank with reason : {}', reason);
        }

        return tankPages;
    }

    /**
     * Fetches tanks data from the database for the given tank pages.
     *
     * @param {number[]} tankPages - Array of tank pages to fetch.
     *
     * @returns {Promise<Tank[]>} - Return the array of tanks data taken from the database.
     */
    private async fetchTanksData(tankPages: number[]): Promise<Tank[]> {
        return (await Promise.all(tankPages.map((page: number) => this.tanksTable.getTankById(page)))) as Tank[];
    }

    /**
     * Extracts tank data from tankopedia responses.
     *
     * @param {TankopediaVehiclesSuccess} responses - Array of tankopedia responses.
     *
     * @returns {VehicleData[]} - Array of tank data.
     */
    private extractTankData(responses: TankopediaVehiclesSuccess): VehicleData[] {
        return Object.values(responses.data);
    }

    /**
     * Stores an array of tank objects and their corresponding ammo index in the database as trivia questions.
     *
     * @param {Tank[]} tank - An array of Tank objects representing the trivia questions.
     * @param {{ tank: Tank; ammoIndex: number }} datum - The data of the tank selected
     * @param {number} i - The question number
     *
     * @returns {Promise<void>} A promise that resolves when all questions are stored, or rejects if an error occurs.
     *
     * @example (Within the class):
     * const tanks = [...]; // Array of Tank objects
     * const datum = { tank: tanks[1], ammoIndex: 1 };
     * await this.storeQuestionInDatabase(tanks, tanksId, datum);
     */
    private async storeQuestionInDatabase(tank: Tank[], datum: { tank: Tank; ammoIndex: number }, i: number): Promise<void> {
        try {
            for (const data of tank) {
                await this.triviaTable.addTrivia(new Date(), data.id, data.name === datum.tank.name ? datum.ammoIndex : null);
                await EnvUtil.sleep(TimeEnum.SECONDE);
            }
            this.logger.debug('Successfully stored tank in database for question n°{}', i);
        } catch (reason) {
            this.logger.warn('At least a question failed to be insert in the database, error {}', reason);
        }
    }

    /**
     * Retrieve the tanks from the data get from the database
     *
     * @param {TriviaQuestion[]} tanks - The array to data concerning the trivia question
     */
    private retrieveTanksFromDatabase(tanks: TriviaQuestion[]): void {
        for (let i = 0; i < this.maxNumberOfQuestion; i++) {
            this._allTanks.push(
                tanks.splice(0, 4).map((question: TriviaQuestion) => {
                    if (question.ammoIndex !== null) {
                        this._selectedTanks.push(question as TriviaSelected);

                        this.logger.info(
                            `Tank for game selected for question n°${i} : {}, the ammo type is : {}`,
                            this._selectedTanks[i].tank.name,
                            this._selectedTanks[i].ammoIndex ? ShellType.GOLD : ShellType.NORMAL
                        );
                    }

                    return question.tank;
                })
            );
        }
    }
}
