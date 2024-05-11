import { type Client, Colors, EmbedBuilder, type TextChannel } from 'discord.js';
import { basename } from 'node:path';
import { ShellEnum, ShellType } from '../../feature/slash-commands/enums/shell.enum';
import type { WotApiModel } from '../apis/wot-api.model';
import { EmojiEnum } from '../enums/emoji.enum';
import { TimeEnum } from '../enums/time.enum';
import { ChannelsTable } from '../tables/channels.table';
import { PlayersAnswersTable } from '../tables/players-answers.table';
import { PlayersTable } from '../tables/players.table';
import { TanksTable } from '../tables/tanks.table';
import { TriviaDataTable } from '../tables/trivia-data.table';
import { TriviaTable } from '../tables/trivia.table';
import type { Tank, TriviaAnswer, TriviaData, TriviaPlayer, TriviaQuestion } from '../types/table.type';
import type { TriviaSelected } from '../types/trivia.type';
import type { TankopediaVehiclesSuccess, VehicleData } from '../types/wot-api.type';
import { DateUtil } from '../utils/date.util';
import { Logger } from '../utils/logger';
import { RandomUtil } from '../utils/random.util';
import { UserUtil } from '../utils/user.util';
import { MEDAL } from '../utils/variables.util';

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
    private readonly _datum: TriviaSelected[];
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
     * Used to randomise the tank selected
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
    /**
     * The id of the trivia question
     */
    private triviaId: number;
    //endregion

    private constructor() {
        const api = require('../apis/wot-api.model').WotApiModel;

        this.wotApi = new api();
        this.logger = new Logger(basename(__filename));
        this.channels = new ChannelsTable();
        this.triviaDataTable = new TriviaDataTable();
        this.tanksTable = new TanksTable();
        this.triviaTable = new TriviaTable();
        this.playerAnswerTable = new PlayersAnswersTable();
        this.playerTable = new PlayersTable();

        this._allTanks = [];
        this._datum = [];

        setTimeout(async (): Promise<void> => {
            this.maxNumberOfQuestion = await this.triviaDataTable.getMaxNumberOfQuestion();
            this.totalNumberOfTanks = await this.tanksTable.countAll();
            this.lastTankPage = await this.triviaDataTable.getLastTankPage();
            this.maxNumberOfUniqueTanks = await this.triviaDataTable.getMaxNumberOfUniqueTanks();
            this.triviaId = await this.triviaTable.getLastTriviaId();
        });

        this.logger.info(`${EmojiEnum.HAMMER} {} instance initialized`, TriviaSingleton.name);

        this.fetchTankOfTheDay.bind(this);
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
    get datum(): TriviaSelected[] {
        return this._datum;
    }

    get allTanks(): Tank[][] {
        return this._allTanks;
    }
    //endregion

    /**
     * Fetches tank of the day for the trivia game.
     *
     * If the bot already store the question in the database and was reset. Get the question from de database.
     *
     * Otherwise, create the question and store it in the database
     */
    public async fetchTankOfTheDay(): Promise<void> {
        const tanks: TriviaQuestion[] = await this.triviaTable.getTriviaFromDateWithTank(new Date());

        if (tanks.length > 0) {
            this.logger.debug('Trivia tanks already fetch, backing up from database');
            this.retrieveTanksFromDatabase(tanks);
            return;
        }

        for (let i = 0; i < this.maxNumberOfQuestion; i++) {
            this.logger.debug(`Start fetching tanks n°${i}`);
            const tankPages = await this.createTankPages();
            this._allTanks.push(await this.fetchTanksData(tankPages));

            this._datum.push({
                id: this.triviaId,
                tank: this._allTanks[i][RandomUtil.getRandomNumber(this._allTanks.length - 1)],
                ammoIndex: RandomUtil.getRandomNumber(),
            });

            await this.storeTankInDatabase(i, tankPages);

            this.triviaId++;

            this.logger.info(
                `Tank for game selected for question n°${i} : {}, the ammo type is : {}`,
                this._datum[i].tank.name,
                this._datum[i].ammoIndex ? ShellType.GOLD : ShellType.NORMAL
            );
        }
    }

    public async sendTriviaResultForYesterday(client: Client): Promise<void> {
        this.logger.debug('Start collecting data to send the trivia result');
        this.channel = await UserUtil.fetchChannelFromClient(client, await this.channels.getTrivia());

        let tanks: TriviaQuestion[] = await this.triviaTable.getTriviaFromDateWithTank(DateUtil.getPreviousDayAsDate());

        if (tanks.length === 0) {
            this.logger.debug('No tanks fetch yesterday ! Not sending result');
            return;
        }

        tanks = tanks.filter((question: TriviaQuestion): boolean => question.ammoIndex !== null);

        for (const selected of tanks) {
            const index: number = tanks.indexOf(selected);

            const triviaAnswers: (TriviaAnswer & TriviaPlayer)[] = await this.playerAnswerTable.getTopThreeForYesterday(tanks[index].id);

            const answerEmbed = new EmbedBuilder()
                .setTitle(`Question n°${index + 1}`)
                .setColor(Colors.DarkGold)
                .setImage(selected.tank.image)
                .setDescription(`Le char à deviner était : \`${selected.tank.name}\``)
                .setFooter({ text: 'Trivia Game' })
                .setFields(
                    {
                        name: 'Obus normal',
                        value: `\`${ShellEnum[selected.tank.ammo[0].type as keyof typeof ShellEnum]} ${selected.tank.ammo[0].damage[1]}\``,
                        inline: true,
                    },
                    {
                        name: 'Obus spécial (ou gold)',
                        value: `\`${ShellEnum[selected.tank.ammo[1].type as keyof typeof ShellEnum]} ${selected.tank.ammo[1].damage[1]}\``,
                        inline: true,
                    },
                    {
                        name: 'Obus explosif',
                        value: `\`${ShellEnum[selected.tank.ammo[2].type as keyof typeof ShellEnum]} ${selected.tank.ammo[2].damage[1]}\``,
                        inline: true,
                    }
                );

            const playerEmbed = new EmbedBuilder()
                .setTitle(':trophy: Podium des joueurs :trophy: ')
                .setColor(Colors.DarkGold)
                .setFooter({ text: 'Trivia Game' });

            if (triviaAnswers.length === 0) {
                this.logger.debug('No players answer to the question n°{}', index + 1);
                playerEmbed.setDescription("Aucun joueur n'a envoyé de réponse ou répondu correctement à cette question");
            } else {
                playerEmbed.setFields({
                    name: 'Top 3',
                    value: triviaAnswers.reduce((sentence: string, player: TriviaAnswer & TriviaPlayer, index: number): string => {
                        this.logger.debug('The following player {} is in the top 3 for the question n°{}', player.name, index + 1);

                        return `${sentence}\n${MEDAL[index]}\`${player.name}\` en ${this.calculateResponseTime(player.answer_time as number)}`;
                    }, ''),
                });
            }

            this.logger.debug('Sending message in channel for question n°{}', String(index + 1));
            await this.channel.send({ embeds: [answerEmbed, playerEmbed] });
        }
    }

    /**
     * Reduces the Elo of inactive players for the previous day.
     *
     * Inactive players are those who did not participate in the trivia game on the previous day.
     *
     * The Elo reduction factor is 1.8%.
     */
    public async reduceEloOfInactifPlayer(): Promise<void> {
        const tanks: TriviaQuestion[] = await this.triviaTable.getTriviaFromDateWithTank(DateUtil.getPreviousDayAsDate());

        if (tanks.length === 0) {
            this.logger.debug('No tanks fetch yesterday ! Not reducing elo of inactif player');
            return;
        }

        this.logger.debug('Start removing elo of inactif player');
        const players = await this.playerTable.getAllPlayers();

        if (players.length === 0) {
            this.logger.warn('No players fetch for trivia !');
            return;
        }

        const yesterday: Date = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const embedPlayer: EmbedBuilder = new EmbedBuilder()
            .setTitle('Joueur inactif')
            .setColor(Colors.DarkGold)
            .setDescription('Voici la liste des joueurs inactifs qui ont perdu des points');

        let hasInactifPlayer = false;

        for (const player of players) {
            const answer: TriviaAnswer = await this.playerAnswerTable.getLastAnswerOfPlayer(player.id);
            const oldElo: number = answer?.elo ?? 0;

            if (answer?.trivia_id === null && oldElo > 0) {
                hasInactifPlayer = true;
                const elo: number = Math.round(oldElo * 0.982);

                await this.playerAnswerTable.addAfkAnswer(player.id, DateUtil.getPreviousDayAsDate(), elo);

                this.logger.debug('Inactif player spotted : {}, old elo : {}, new elo : {}', player.name, oldElo, elo);
                embedPlayer.addFields({
                    name: player.name,
                    value: `Diminution de \`${oldElo - elo}\` d'élo`,
                    inline: true,
                });
            }
        }

        if (hasInactifPlayer) {
            await this.channel.send({ embeds: [embedPlayer] });
        }
        this.logger.debug('End removing elo of inactif player');
    }

    /**
     * Update the tanks table in the database with the data of the tankopedia (Wargaming api). Mostly used to get new tanks
     */
    public async updateDatabase(): Promise<void> {
        this.logger.info('Start updating the tanks database');

        const allTanks: VehicleData[] = this.extractTankData(await this.wotApi.fetchTankopediaApi());

        for (const tankWot of Object.values(allTanks)) {
            const tank: Tank | null = await this.tanksTable.getTankByName(tankWot.name);

            if (tank) {
                return;
            }

            try {
                await this.tanksTable.insertTank(tankWot.name, tankWot.images.big_icon, tankWot.default_profile.ammo);
                this.logger.debug('Successfully insert tank {} in database', tankWot.name);
            } catch (reason) {
                this.logger.warn(`Failed to insert tank {} in database with reason {}`, tankWot.name, reason);
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
            this.logger.debug('Successfully update the array of tank already selected');
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
     * Store the question selected in the database
     *
     * @param {number} i - The question number
     * @param {number[]} tanksId - The list of tanks id
     */
    private async storeTankInDatabase(i: number, tanksId: number[]): Promise<void> {
        const promise: Promise<boolean>[] = this._allTanks[i].map((tank: Tank, index: number) =>
            this.triviaTable.addTrivia(
                new Date(),
                this.triviaId,
                tanksId[index],
                tank.name === this._datum[i].tank.name ? this._datum[i].ammoIndex : null
            )
        );

        try {
            await Promise.all(promise);
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
                        this._datum.push(question as TriviaSelected);

                        this.logger.info(
                            `Tank for game selected for question n°${i} : {}, the ammo type is : {}`,
                            this._datum[i].tank.name,
                            this._datum[i].ammoIndex ? ShellType.GOLD : ShellType.NORMAL
                        );
                    }

                    return question.tank;
                })
            );
        }
    }
}
