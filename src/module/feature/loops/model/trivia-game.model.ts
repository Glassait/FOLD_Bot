import { InventoryInjector, LoggerInjector, StatisticInjector } from '../../../shared/decorators/injector.decorator';
import { Logger } from '../../../shared/classes/logger';
import { TriviaType } from '../../../shared/types/inventory.type';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    Client,
    Colors,
    ComponentType,
    EmbedBuilder,
    Message,
    TextChannel,
} from 'discord.js';
import { InventorySingleton } from '../../../shared/singleton/inventory.singleton';
import { RandomUtil } from '../../../shared/utils/random.util';
import { Ammo, TankopediaVehiclesSuccess, VehicleData } from '../types/wot-api.type';
import { WotApiModel } from './wot-api.model';
import { StatisticSingleton } from 'src/module/shared/singleton/statistic.singleton';
import {
    MonthlyTriviaOverallStatisticType,
    MonthlyTriviaPlayerStatisticType,
    TriviaPlayerStatisticType,
    TriviaStatisticType,
} from '../../../shared/types/statistic.type';
import { ShellEnum, ShellType } from '../enums/shell.enum';
import { TimeEnum } from '../../../shared/enums/time.enum';
import { TimeUtil } from '../../../shared/utils/time.util';
import { PlayerAnswer } from '../types/trivia-game.type';
import { MEDAL } from '../../../shared/utils/variables.util';

/**
 * This class is responsible for managing the trivia game.
 */
@LoggerInjector
@InventoryInjector
@StatisticInjector
export class TriviaGameModel {
    //region PUBLIC READONLY
    /**
     * Maximum time allowed for a player to answer the trivia question.
     */
    public readonly MAX_TIME: number = TimeEnum.MINUTE * 5;
    //endregion

    //region PRIVATE
    /**
     * The information fetch from the inventory
     * @private
     */
    private trivia: TriviaType;
    /**
     * Channel where the trivia game is being played.
     * @private
     */
    private channel: TextChannel;
    /**
     * Array of all tanks used in the trivia game.
     * @private
     */
    private allTanks: VehicleData[];
    /**
     * Tank selected for the current trivia game.
     * @private
     */
    private datum: { tank: VehicleData; ammoIndex: number; isPen: boolean };
    /**
     * Message containing the trivia game components.
     * @private
     */
    private gameMessage: Message<true>;
    /**
     * Timestamp when the trivia game started.
     * @private
     */
    private timer: number;
    /**
     * Mapping of players and their answers.
     * @private
     */
    private playerAnswer: { [key: string]: PlayerAnswer } = {};
    /**
     * Trivia statistics.
     * @private
     */
    private triviaStats: TriviaStatisticType;
    //endregion

    //region INJECTION
    private readonly logger: Logger;
    private readonly inventory: InventorySingleton;
    private readonly wotApi: WotApiModel = new WotApiModel();
    private readonly statistic: StatisticSingleton;
    //endregion

    //region PRIVATE READONLY
    /**
     * Embed used to display information about the trivia game.
     * @private
     */
    private readonly startGameEmbed: EmbedBuilder = new EmbedBuilder().setTitle('Trivia Game').setColor(Colors.Aqua);
    /**
     * Embed used to display the answer to the trivia question and the top 3 players.
     * @private
     */
    private readonly answerEmbed: EmbedBuilder = new EmbedBuilder().setTitle('Trivia Game : RÉSULTAT').setColor(Colors.Green);
    /**
     * The max time to give bonus elo to the player
     * @private
     */
    private readonly responseTimeLimit = TimeEnum.SECONDE * 10;
    //endregion

    /**
     * Fetches the necessary services and initializes the model.
     * @param client Discord client.
     */
    public async fetchMandatory(client: Client): Promise<void> {
        this.channel = await this.inventory.getChannelForTrivia(client);
        this.trivia = this.inventory.trivia;
        this.triviaStats = this.statistic.trivia;
    }

    /**
     * Fetches the tanks to be used in the trivia game.
     */
    public async fetchTanks(): Promise<void> {
        this.logger.debug('Start fetching tanks');
        const pages: number[] = RandomUtil.getArrayWithRandomNumber(4, this.trivia.limit, 1, false, this.inventory.triviaLastPage);
        const tankopediaResponses: TankopediaVehiclesSuccess[] = [];

        this.inventory.triviaLastPage = [
            ...this.inventory.triviaLastPage.slice(this.inventory.triviaLastPage.length >= 12 ? 4 : 0),
            ...pages,
        ];

        for (const page of pages) {
            tankopediaResponses.push(await this.wotApi.fetchTankopediaApi(this.trivia.url.replace('pageNumber', String(page))));
        }

        if (tankopediaResponses[0].meta.count !== this.trivia.limit) {
            this.trivia.limit = tankopediaResponses[0].meta.page_total;
            this.inventory.trivia = this.trivia;
        }

        this.allTanks = tankopediaResponses.reduce((data: VehicleData[], vehicles: TankopediaVehiclesSuccess): VehicleData[] => {
            data.push(vehicles.data[Object.keys(vehicles.data)[0]]);
            return data;
        }, []);

        this.datum = {
            tank: this.allTanks[RandomUtil.getRandomNumber(this.allTanks.length - 1)],
            ammoIndex: RandomUtil.getRandomNumber(),
            isPen: RandomUtil.getRandomNumber() !== 0,
        };

        this.logger.info(
            `Tank for game selected : \`${this.datum.tank.name}\`, the ammo type is : ${
                this.datum.ammoIndex ? `\`${ShellType.GOLD}\`` : `\`${ShellType.NORMAL}\``
            } and the question is for ${this.datum.isPen ? '`penetration`' : '`damage`'}`
        );
    }

    /**
     * Sends a message to the trivia game channel with information about the game and the selected tank.
     */
    public async sendMessageToChannel(): Promise<void> {
        const target = new Date();
        target.setMinutes(target.getMinutes() + this.MAX_TIME / TimeEnum.MINUTE);
        const ammo: Ammo = this.datum.tank.default_profile.ammo[this.datum.ammoIndex];
        this.startGameEmbed.setFields(
            {
                name: ' Règle du jeu',
                value: `Les règles sont simples :\n\t - ✏ 1 obus (dégât ou pénétration, normal ou gold),\n- 🚗 4 chars  tier X,\n- ✔ 1 bonne réponse (⚠️Quand 2 ou plusieurs chars on le même obus, tous ces chars sont des bonnes réponses),\n- 🕒 ${
                    this.MAX_TIME / TimeEnum.MINUTE
                } minutes (fini <t:${TimeUtil.convertToUnix(target)}:R>).\n**⚠️ Ce n'est pas forcèment le dernier canon utilisé !**`,
            },
            {
                name: `Obus-${this.datum.isPen ? 'Pénétration' : 'Dégât'} :`,
                value: `\`${ShellEnum[ammo.type as keyof typeof ShellEnum]} ${this.datum.isPen ? ammo.penetration[1] : ammo.damage[1]}\` (${
                    this.datum.isPen ? 'pénétration' : 'dégât'
                })`,
                inline: true,
            }
        );

        const row: ActionRowBuilder<ButtonBuilder> = this.allTanks.reduce(
            (rowBuilder: ActionRowBuilder<ButtonBuilder>, data: VehicleData) => {
                rowBuilder.addComponents(new ButtonBuilder().setCustomId(`${data.name}`).setLabel(data.name).setStyle(ButtonStyle.Primary));
                return rowBuilder;
            },
            new ActionRowBuilder<ButtonBuilder>()
        );

        this.gameMessage = await this.channel.send({
            content: '@here',
            embeds: [this.startGameEmbed],
            components: [row],
        });
        this.logger.debug('Trivia game message send to the guild');
        this.timer = Date.now();
    }

    /**
     * Collects the answers from the players.
     */
    public async collectAnswer(): Promise<void> {
        this.logger.debug('Collecting player answer start');
        this.playerAnswer = {};
        this.gameMessage
            .createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: this.MAX_TIME,
            })
            .on('collect', async (interaction: ButtonInteraction<'cached'>): Promise<void> => {
                try {
                    let hasAlreadyAnswer: boolean = false;
                    if (this.playerAnswer[interaction.user.username]) {
                        hasAlreadyAnswer = true;
                        await interaction.deferUpdate();
                    } else {
                        await interaction.deferReply({ ephemeral: true });
                    }

                    let changedAnswer: boolean = false;
                    if (hasAlreadyAnswer) {
                        if (this.playerAnswer[interaction.user.username].response === interaction.customId) {
                            await this.playerAnswer[interaction.user.username].interaction.editReply({
                                content: `Ta réponse \`${interaction.customId}\` à bien été pris en compte !\nTu as déjà cliqué sur cette réponse !`,
                            });
                        } else {
                            changedAnswer = true;
                            this.playerAnswer[interaction.user.username] = {
                                responseTime: Date.now() - this.timer,
                                response: interaction.customId,
                                interaction: this.playerAnswer[interaction.user.username].interaction,
                            };

                            await this.playerAnswer[interaction.user.username].interaction.editReply({
                                content: `Ta réponse \`${interaction.customId}\` à bien été pris en compte !`,
                            });
                        }
                    } else {
                        this.playerAnswer[interaction.user.username] = {
                            responseTime: Date.now() - this.timer,
                            response: interaction.customId,
                            interaction: interaction,
                        };

                        await interaction.editReply({
                            content: `Ta réponse \`${interaction.customId}\` à bien été pris en compte !`,
                        });
                    }

                    this.logCollect(hasAlreadyAnswer, changedAnswer, interaction);
                } catch (error) {
                    this.logger.error(`Error during collection of answer${error}`, error);
                }
            });
    }

    /**
     * Sends the answer to the trivia game channel and updates the player statistics.
     */
    public async sendAnswerToChannel(): Promise<void> {
        this.logger.debug('Collect answer end. Start calculating the scores');
        const playersResponse: [string, PlayerAnswer][] = Object.entries(this.playerAnswer).sort(
            (a: [string, PlayerAnswer], b: [string, PlayerAnswer]) => a[1].responseTime - b[1].responseTime
        );

        this.answerEmbed.setImage(this.datum.tank.images.big_icon).setDescription(`Le char à deviner était : \`${this.datum.tank.name}\``);
        const otherAnswer: string[] = ['Les autres bonnes réponses sont :'];

        const ammo: Ammo = this.datum.tank.default_profile.ammo[this.datum.ammoIndex];

        this.allTanks.forEach((vehicle: VehicleData): void => {
            const vehicleAmmo: Ammo = vehicle.default_profile.ammo[this.datum.ammoIndex];
            if (vehicle.name !== this.datum.tank.name && vehicleAmmo.type === ammo.type && this.checkVehicleAmmoDetail(vehicleAmmo, ammo)) {
                this.logger.debug(`Another tank has the same shell \`${vehicle.name}\``);
                otherAnswer.push(vehicle.name);
            }
        });
        this.answerEmbed.setFields([]);
        if (otherAnswer.length > 1) {
            this.answerEmbed.setFields({ name: 'Autre bonne réponses :', value: otherAnswer.join('\n') });
        }

        let description: string = playersResponse.length > 0 ? '' : "Aucun joueur n'a envoyé de réponse !";

        const goodAnswer: [string, PlayerAnswer][] = playersResponse.filter((value: [string, PlayerAnswer]): boolean =>
            this.isGoodAnswer(value)
        );

        for (let i = 0; i < 3; i++) {
            if (goodAnswer[i]) {
                description += `${MEDAL[i]} ${goodAnswer[i][0]} en ${this.calculateResponseTime(goodAnswer[i])}\n`;
            }
        }

        description = description || "Aucun joueur n'a trouvé la bonne réponse !";

        const playerEmbed: EmbedBuilder = new EmbedBuilder()
            .setTitle('Joueurs')
            .setDescription(description)
            .setColor(goodAnswer.length === 0 ? Colors.Red : Colors.Gold);

        await this.gameMessage.edit({ embeds: [this.answerEmbed, playerEmbed], components: [] });
        this.logger.debug('Game message update with answer and top 3 players');

        await this.updateStatistic(playersResponse, goodAnswer);
    }

    /**
     * Check if the vehicle ammo is the same as the datum ammo.
     * @param vehicleAmmo The vehicle ammo
     * @param ammo The datum ammo
     * @return true if the vehicle ammo is the same (penetration or damage), false otherwise
     * @private
     */
    private checkVehicleAmmoDetail(vehicleAmmo: Ammo, ammo: Ammo): boolean {
        if (this.datum.isPen) {
            return vehicleAmmo.penetration[1] === ammo.penetration[1];
        }
        return vehicleAmmo.damage[1] === ammo.damage[1];
    }

    /**
     * Calculates the time taken by the player to answer the trivia question.
     * @param playersResponse Array of players and their responses.
     * @returns The time taken by the player to answer the trivia question.
     */
    private calculateResponseTime(playersResponse: [string, PlayerAnswer]): string {
        const sec = playersResponse[1].responseTime / TimeEnum.SECONDE;
        return sec > 60 ? `${Math.floor(sec / 60)}:${Math.round(sec % 60)} minutes` : `${sec.toFixed(2)} secondes`;
    }

    /**
     * Checks if the player's answer is correct.
     * @param playerResponse The player's response.
     * @returns true if the player's answer is correct, false otherwise.
     */
    private isGoodAnswer(playerResponse: [string, PlayerAnswer]): boolean {
        return playerResponse[1].response === this.datum.tank.name || this.isAnotherTanks(playerResponse);
    }

    /**
     * This method check if there are another tanks that have the same shell (damage and type)
     * @param playerResponse The answer of the player
     * @return true if there are another tanks that have the same shell (damage and type), false otherwise
     * @private
     */
    private isAnotherTanks(playerResponse: [string, PlayerAnswer]): boolean {
        const vehicle: VehicleData | undefined = this.allTanks.find(
            (vehicle: VehicleData): boolean => vehicle.name === playerResponse[1].response
        );

        if (!vehicle) {
            return false;
        }

        const vehicleAmmo: Ammo = vehicle.default_profile.ammo[this.datum.ammoIndex];
        const ammo: Ammo = this.datum.tank.default_profile.ammo[this.datum.ammoIndex];
        return vehicleAmmo.type === ammo.type && this.checkVehicleAmmoDetail(vehicleAmmo, ammo);
    }

    /**
     * Asynchronous function for updating trivia statistics based on player responses.
     *
     * @param {[string, PlayerAnswer][]} responses - Array of player responses, where each element is a tuple [playerId, playerAnswer].
     * @param {[string, PlayerAnswer][]} goodAnswer - Array of correct player responses, where each element is a tuple [playerId, playerAnswer].
     * @returns {Promise<void>} - A Promise that resolves after updating the trivia statistics.
     */
    private async updateStatistic(responses: [string, PlayerAnswer][], goodAnswer: [string, PlayerAnswer][]): Promise<void> {
        this.logger.debug('Start updating the overall statistics');
        this.updateOverallStatistic(responses);

        this.logger.debug("Start updating the player's statistics");

        for (const [playerId, playerAnswer] of responses) {
            this.logger.debug(`Start updating \`${playerId}\` statistic`);
            await this.updatePlayerStatistic(playerId, playerAnswer, goodAnswer);
            this.logger.debug(`End updating \`${playerId}\` statistic`);
        }

        this.statistic.trivia = this.triviaStats;
    }

    /**
     * Update the overall stats
     * @param responses the answer list
     * @private
     */
    private updateOverallStatistic(responses: [string, PlayerAnswer][]): void {
        const overall: MonthlyTriviaOverallStatisticType = this.triviaStats.overall[this.statistic.currentMonth] ?? {
            number_of_game: 0,
            game_without_participation: 0,
            unique_tanks: [],
        };

        overall.number_of_game++;

        if (responses.length === 0) {
            overall.game_without_participation++;
        }
        if (overall.unique_tanks && !overall.unique_tanks.includes(this.datum.tank.name)) {
            overall.unique_tanks.push(this.datum.tank.name);
        }

        this.triviaStats.overall[this.statistic.currentMonth] = overall;
    }

    /**
     * Calculates and returns the new Elo rating for a player based on their statistics and performance.
     *
     * @param {MonthlyTriviaPlayerStatisticType} playerStat - The player's monthly statistic object.
     * @param {PlayerAnswer} playerAnswer - The player's answer object.
     * @param {number} index - The index of the correct answer in the list.
     * @returns {number} - The new Elo rating for the player.
     */
    private calculateElo(playerStat: MonthlyTriviaPlayerStatisticType, playerAnswer: PlayerAnswer, index: number): number {
        let gain = -Math.floor(25 * Math.exp(0.001 * playerStat.elo));
        if (index >= 1) {
            gain = Math.floor((50 / (index * 0.5)) * Math.exp(-0.001 * playerStat.elo));

            if (playerAnswer.responseTime <= this.responseTimeLimit) {
                gain += Math.floor(gain * 0.25);
            }
        }

        return Math.max(0, playerStat.elo + gain);
    }

    /**
     * This method manage the log write when a player use trivia button
     * @param alreadyAnswer If the player already answer
     * @param changedAnswer If the player changed his answer
     * @param interaction The interaction
     */
    private logCollect(alreadyAnswer: boolean, changedAnswer: boolean, interaction: ButtonInteraction<'cached'>): void {
        let action: string = 'answered';
        if (alreadyAnswer) {
            action = changedAnswer ? 'changed his answer' : 'already answered';
        }

        this.logger.debug(
            `${interaction.member?.nickname ?? interaction.user.displayName} ${action} to the trivia game with: \`${interaction.customId}\``
        );
    }

    /**
     * Updates the statistics for a specific player.
     *
     * @param {string} playerId - The ID of the player.
     * @param {PlayerAnswer} playerAnswer - The player's answer object.
     * @param {[string, PlayerAnswer][]} goodAnswer - Array of correct player responses, where each element is a tuple [playerId, playerAnswer].
     */
    private async updatePlayerStatistic(playerId: string, playerAnswer: PlayerAnswer, goodAnswer: [string, PlayerAnswer][]): Promise<void> {
        const player: TriviaPlayerStatisticType = this.triviaStats.player[playerId] ?? {};

        const playerStat: MonthlyTriviaPlayerStatisticType = player[this.statistic.currentMonth] ?? {
            elo: 0,
            right_answer: 0,
            win_strick: { current: 0, max: 0 },
            answer_time: [],
            participation: 0,
        };
        playerStat.participation++;
        playerStat.answer_time.push(playerAnswer.responseTime);

        const isGoodAnswer = goodAnswer.find((value: [string, PlayerAnswer]): boolean => value[0] === playerId);

        const oldElo = playerStat.elo;
        playerStat.elo = this.calculateElo(playerStat, playerAnswer, isGoodAnswer ? goodAnswer.indexOf(isGoodAnswer) + 1 : -1);

        const winStrick = playerStat.win_strick as { current: number; max: number };

        if (isGoodAnswer) {
            await this.handleGoodAnswer(playerStat, winStrick, playerAnswer, oldElo, playerId);
        } else {
            await this.handleWrongAnswer(playerStat, winStrick, playerAnswer, oldElo, playerId);
        }

        player[this.statistic.currentMonth] = playerStat;
        this.triviaStats.player[playerId] = player;
    }

    /**
     * Handles the scenario when the player gives a correct answer.
     *
     * @param {MonthlyTriviaPlayerStatisticType} playerStat - The player's monthly statistic object.
     * @param {{ current: number; max: number }} winStrick - The player's win streak object.
     * @param {PlayerAnswer} playerAnswer - The player's answer object.
     * @param {number} oldElo - The player's old Elo value.
     * @param {string} playerId - The ID of the player.
     *
     * @private
     */
    private async handleGoodAnswer(
        playerStat: MonthlyTriviaPlayerStatisticType,
        winStrick: {
            current: number;
            max: number;
        },
        playerAnswer: PlayerAnswer,
        oldElo: number,
        playerId: string
    ): Promise<void> {
        playerStat.right_answer++;
        winStrick.current++;
        winStrick.max = Math.max(winStrick.current, winStrick.max);

        await playerAnswer.interaction.editReply({
            content: `Tu as eu la bonne réponse, bravo :clap:.\nTon nouvelle elo est : \`${playerStat.elo}\` (modification de \`${
                playerStat.elo - oldElo
            }\`)`,
        });
        this.logger.debug(`Player \`${playerId}\` found the right answer`);
    }

    /**
     * Handles the scenario when the player gives a wrong answer.
     *
     * @param {string} playerId - The ID of the player.
     * @param {PlayerAnswer} playerAnswer - The player's answer object.
     * @param {MonthlyTriviaPlayerStatisticType} playerStat - The player's monthly statistic object.
     * @param {{ current: number; max: number }} winStrick - The player's win streak object.
     * @param {number} oldElo - The player's old Elo value.
     */
    private async handleWrongAnswer(
        playerStat: MonthlyTriviaPlayerStatisticType,
        winStrick: {
            current: number;
            max: number;
        },
        playerAnswer: PlayerAnswer,
        oldElo: number,
        playerId: string
    ): Promise<void> {
        winStrick.current = 0;
        const tank = this.allTanks.find((tank: VehicleData): boolean => tank.name === playerAnswer.response);

        if (!tank) {
            return;
        }

        const ammo = tank.default_profile.ammo[this.datum.ammoIndex];
        await playerAnswer.interaction.editReply({
            content: `Tu n'as pas eu la bonne réponse !\nLe char \`${tank.name}\` a un obus ${
                this.datum.ammoIndex ? ShellType.GOLD : ShellType.NORMAL
            } \`${ShellEnum[ammo.type as keyof typeof ShellEnum]}\` avec ${this.datum.isPen ? 'une pénétration' : 'un alha'} de \`${
                this.datum.isPen ? ammo.penetration[1] : ammo.damage[1]
            }\`.\nTon nouvelle elo est : \`${playerStat.elo}\` (modification de \`${playerStat.elo - oldElo}\`)`,
        });
        this.logger.debug(`Player \`${playerId}\` failed to find the right answer`);
    }
}
