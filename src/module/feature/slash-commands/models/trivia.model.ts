import {
    ActionRowBuilder,
    type BooleanCache,
    ButtonBuilder,
    type ButtonInteraction,
    ButtonStyle,
    type CacheType,
    type ChatInputCommandInteraction,
    Colors,
    ComponentType,
    EmbedBuilder,
    type Message,
} from 'discord.js';
import type { Ammo } from '../../../shared/apis/wot/models/wot-api.type';
import { LoggerInjector } from '../../../shared/decorators/injector/logger-injector.decorator';
import { TimeEnum } from '../../../shared/enums/time.enum';
import type { TriviaSelected } from '../../../shared/singleton/trivia/models/trivia.type';
import type { TriviaAnswer } from '../../../shared/tables/complexe-table/players-answers/models/players-answers.type';
import type { TriviaPlayer } from '../../../shared/tables/complexe-table/players/models/players.type';
import type { Tank } from '../../../shared/tables/complexe-table/tanks/models/tanks.type';
import type { TriviaData } from '../../../shared/tables/complexe-table/trivia-data/models/trivia-data.type';
import type { WinStreak } from '../../../shared/tables/complexe-table/win-streak/models/win-streak.type';
import { transformToCode } from '../../../shared/utils/string.util';
import { convertToUnix } from '../../../shared/utils/time.util';
import { ShellEnum, ShellType } from '../enums/shell.enum';
import type { PlayerAnswer } from '../types/trivia-game.type';
import { TriviaStatisticsModel } from './trivia-statistics.model';

@LoggerInjector
export class TriviaModel extends TriviaStatisticsModel {
    //region PRIVATE FIELDS
    /**
     * @see TriviaData.max_duration_of_question
     * @unit minute
     */
    private maxQuestionDuration: TriviaData['max_duration_of_question'];

    /**
     * @see TriviaData.max_response_time_limit
     * @unit second
     */
    private responseTimeLimit: TriviaData['max_response_time_limit'];

    /**
     * @see TriviaData.max_number_of_question
     */
    private maxNumberOfQuestion: TriviaData['max_number_of_question'];

    /**
     * The map of all players with there metadata
     */
    private datum = new Map<
        string,
        {
            player: TriviaPlayer;
            questionNumber: number;
            interaction: ChatInputCommandInteraction;
        }
    >();
    //endregion

    /**
     * Initialize the class
     */
    public async initialize(): Promise<void> {
        this.maxQuestionDuration = TimeEnum.MINUTE * (await this.triviaTable.getMaxDurationOfQuestion());
        this.responseTimeLimit = TimeEnum.SECONDE * (await this.triviaTable.getMaxResponseTimeLimit());
        this.maxNumberOfQuestion = await this.triviaTable.getMaxNumberOfQuestion();
    }

    /**
     * Callback for the game commande, send the game to the player in ephemeral message
     *
     * @param {ChatInputCommandInteraction} interaction - The chat interaction of the player
     */
    public async sendGame(interaction: ChatInputCommandInteraction): Promise<void> {
        let player: TriviaPlayer | undefined = await this.playersTable.getPlayerByName(interaction.user.username);

        if (!player) {
            try {
                player = await this.addPlayer(interaction.user.username);
            } catch (reason) {
                await interaction.editReply({
                    content:
                        'Il y a un problème avec la base de données, merci de réessayer plus tard. Si le problème persist merci de contacter <@313006042340524033>',
                });
                this.logger.error(`Failed to insert new player in database with error :`, reason);
            }
        }

        const numberOfAnswer: number = await this.playerAnswerTable.countAnswerOfPlayer(player!.id);
        if (numberOfAnswer >= this.maxNumberOfQuestion) {
            await interaction.editReply({
                content: `Tu as atteint le nombre maximum de question par jour ! (actuellement ${this.maxNumberOfQuestion} par jour)\nReviens demain pour pouvoir rejouer !`,
            });
            return;
        }

        if (this.datum.get(player!.name)) {
            await interaction.editReply({
                content: `Tu as déjà une parti de trivia en cours ! Merci d'attendre que la partie précédente ce termine avant de lancer une nouvelle partie`,
            });
            return;
        }

        const value = {
            player: player!,
            questionNumber: numberOfAnswer,
            interaction: interaction,
        };

        this.datum.set(player!.name, value);

        const { allTanks, selectedTanks }: { allTanks?: Tank[]; selectedTanks: TriviaSelected } = this.getData(player!.name);

        if (!allTanks || allTanks.length <= 16) {
            await interaction.editReply({
                content:
                    'Le jeu ne semble pas encore initialisé, merci de réessayer dans quelque minutes. Si le problème persist merci de contacter <@313006042340524033>',
            });
            this.datum.delete(player!.name);
            return;
        }

        const ammo: Ammo = selectedTanks.tank.ammo[selectedTanks.ammoIndex];

        const target = new Date();
        target.setTime(target.getTime() + this.maxQuestionDuration);

        const startGameEmbed: EmbedBuilder = new EmbedBuilder()
            .setTitle('Devine le bon char')
            .setFooter({ text: 'Trivia Game' })
            .setDescription(`Tu es entrain de répondre à la question n°\`${numberOfAnswer + 1}\` sur ${this.maxNumberOfQuestion}`)
            .setColor(Colors.Blurple)
            .setFields(
                {
                    name: '💥 Obus :',
                    value: `\`${ShellEnum[ammo.type as keyof typeof ShellEnum]} ${ammo.damage[1]}\``,
                    inline: true,
                },
                {
                    name: '🕒 Minuteur :',
                    value: `<t:${convertToUnix(target)}:R>`,
                    inline: true,
                }
            );

        const row: ActionRowBuilder<ButtonBuilder> = allTanks.reduce((rowBuilder: ActionRowBuilder<ButtonBuilder>, data: Tank) => {
            rowBuilder.addComponents(
                new ButtonBuilder().setCustomId(`${data.name}#${data.id}`).setLabel(data.name).setStyle(ButtonStyle.Primary)
            );
            return rowBuilder;
        }, new ActionRowBuilder<ButtonBuilder>());

        const gameMessage: Message<BooleanCache<CacheType>> = await interaction.editReply({
            embeds: [startGameEmbed],
            components: [row],
        });
        this.logger.debug('Trivia game message send to {}', interaction.user.username);

        this.collectAnswer(gameMessage, interaction.user.username);
    }

    /**
     * Method to get the data for the trivia game
     *
     * @param {string} username - The username og the player
     *
     * @return { allTanks: VehicleData[]; datum: TriviaSelected } - Object that can be deconstructed
     *
     * @example
     * const { allTanks, datum } = this.getData(interaction.user.username);
     */
    private getData(username: string): { allTanks?: Tank[]; selectedTanks: TriviaSelected } {
        const value = this.datum.get(username);

        return {
            allTanks: this.trivia.allTanks[value?.questionNumber ?? 0],
            selectedTanks: this.trivia.selectedTanks[value?.questionNumber ?? 0],
        };
    }

    /**
     * Collects the answers from the players from his interaction with the button.
     *
     * @param {Message<BooleanCache<CacheType>>} gameMessage - The message send to the channel via interaction reply
     * @param {string} username - The username of the player
     */
    private collectAnswer(gameMessage: Message<BooleanCache<CacheType>>, username: string): void {
        this.logger.debug('Start collecting answer of {}', username);
        const timer = Date.now();
        let playerAnswer: PlayerAnswer | undefined;

        gameMessage
            .createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: this.maxQuestionDuration,
            })
            .on('collect', async (interaction: ButtonInteraction<'cached'>): Promise<void> => {
                try {
                    const hasAlreadyAnswer: boolean = !!playerAnswer?.interaction;
                    let changedAnswer: boolean = false;

                    if (hasAlreadyAnswer) {
                        await interaction.deferUpdate();
                    } else {
                        await interaction.deferReply({ ephemeral: true });
                    }

                    if (!hasAlreadyAnswer || playerAnswer?.response !== interaction.customId) {
                        playerAnswer = {
                            responseTime: Date.now() - timer,
                            response: interaction.customId,
                            interaction: playerAnswer?.interaction ?? interaction,
                        };

                        await playerAnswer.interaction.editReply({
                            content: hasAlreadyAnswer
                                ? `Ta réponse a été mise à jour en \`${interaction.customId.split('#')[0]}\``
                                : `Ta réponse \`${interaction.customId.split('#')[0]}\` a été enregistrée !`,
                        });

                        changedAnswer = true;
                    } else {
                        await playerAnswer.interaction.editReply({
                            content: 'Ta réponse semble être la même que celle que tu as sélectionnée précédemment.',
                        });
                    }

                    this.logCollect(hasAlreadyAnswer, changedAnswer, interaction);
                } catch (error) {
                    this.logger.error(`Error during collecting player answer`, error);
                }
            })
            .on('end', async (): Promise<void> => {
                this.logger.debug('Collect answer of {} end. Start calculating the scores', username);
                await this.sendAnswerToPlayer(username, playerAnswer);
            });
    }

    /**
     * Log the collected answer
     *
     * @param {boolean} alreadyAnswer - If the player already answer
     * @param {boolean} changedAnswer - If the player have change is answer
     * @param {ButtonInteraction<'cached'>} interaction - The button interaction of the player
     */
    private logCollect(alreadyAnswer: boolean, changedAnswer: boolean, interaction: ButtonInteraction<'cached'>): void {
        let action: string = 'answered';
        if (alreadyAnswer) {
            action = changedAnswer ? 'changed his answer' : 'already answered';
        }

        this.logger.debug(
            `{} ${action} to the trivia game with: {}`,
            interaction.member.nickname ?? interaction.user.displayName,
            interaction.customId
        );
    }

    /**
     * Send the answer to the player
     *
     * @param {string} username - The player name
     * @param {PlayerAnswer} [playerAnswer] - The player answer
     */
    private async sendAnswerToPlayer(username: string, playerAnswer?: PlayerAnswer): Promise<void> {
        const { interaction } = this.datum.get(username) ?? {};
        const { allTanks, selectedTanks } = this.getData(username);

        const isGoodAnswer = this.isGoodAnswer(username, playerAnswer);
        const answerEmbed: EmbedBuilder = this.createAnswerEmbed(true, selectedTanks.tank, isGoodAnswer);
        const otherAnswer: EmbedBuilder[] = [];
        const ammo: Ammo = selectedTanks.tank.ammo[selectedTanks.ammoIndex];

        allTanks!.forEach((vehicle: Tank): void => {
            const vehicleAmmo: Ammo = vehicle.ammo[selectedTanks.ammoIndex];
            if (vehicle.name !== selectedTanks.tank.name && this.checkVehicleAmmoDetail(vehicleAmmo, ammo)) {
                this.logger.debug('Another tank has the same shell {}', vehicle.name);
                otherAnswer.push(this.createAnswerEmbed(false, vehicle, isGoodAnswer));
            }
        });

        await interaction?.editReply({ embeds: [answerEmbed, ...otherAnswer], components: [] });
        this.logger.debug("Game's message update with answer");

        await this.updateStatistic(isGoodAnswer, username, playerAnswer);
    }

    /**
     * Create the answer embed to send to the player.
     *
     * @param {boolean} main - If this is the main answer or not
     * @param {Tank} vehicle - The data of the tank
     * @param {boolean} isGoodAnswer - Is the player found the right answer or not
     *
     * @return {EmbedBuilder} - The response embed build by the bot to send to the player
     *
     * @example
     * const embed = this.createAnswerEmbed(true, {...}, true);
     * console.log(embed) // Embed{ title: "Réponse principale", color: Colors.Red, etc. }
     */
    private createAnswerEmbed(main: boolean, vehicle: Tank, isGoodAnswer: boolean): EmbedBuilder {
        return new EmbedBuilder()
            .setTitle(main ? 'Réponse principale' : 'Autre bonne réponse')
            .setColor(isGoodAnswer ? Colors.Green : Colors.Red)
            .setImage(vehicle.image)
            .setDescription(main ? `Le char à deviner était : \`${vehicle.name}\`` : `Le char suivant \`${vehicle.name}\` à le mème obus !`)
            .setFooter({ text: 'Trivia Game' })
            .setFields(
                {
                    name: 'Obus normal',
                    value: `\`${ShellEnum[vehicle.ammo[0].type as keyof typeof ShellEnum]} ${vehicle.ammo[0].damage[1]}\``,
                    inline: true,
                },
                {
                    name: 'Obus spécial (ou gold)',
                    value: `\`${ShellEnum[vehicle.ammo[1].type as keyof typeof ShellEnum]} ${vehicle.ammo[1].damage[1]}\``,
                    inline: true,
                },
                {
                    name: 'Obus explosif',
                    value: `\`${ShellEnum[vehicle.ammo[2].type as keyof typeof ShellEnum]} ${vehicle.ammo[2].damage[1]}\``,
                    inline: true,
                }
            );
    }

    /**
     * Check if the given vehicle have the same ammo that the given ammo
     *
     * @param {Ammo} vehicleAmmo - The vehicle ammo to check
     * @param {Ammo} ammo - The base ammo
     *
     * @return {boolean} - True the vehicle ammo has the same type and alpha, false otherwise
     */
    private checkVehicleAmmoDetail(vehicleAmmo: Ammo, ammo: Ammo): boolean {
        return vehicleAmmo.type === ammo.type && vehicleAmmo.damage[1] === ammo.damage[1];
    }

    /**
     * Check if the player answers is the good answer
     *
     * @param {string} username - The player username
     * @param {PlayerAnswer} [playerAnswer] - The player answer
     *
     * @return {boolean} - True if the player answer is the good answer, false otherwise
     */
    private isGoodAnswer(username: string, playerAnswer?: PlayerAnswer): boolean {
        if (!playerAnswer) {
            return false;
        }

        const { selectedTanks } = this.getData(username);
        const tankId = Number(playerAnswer.response.split('#')[1]);
        return tankId === selectedTanks.tank.id || this.isAnotherTanks(tankId, username);
    }

    /**
     * Check if another tanks is the good answer.
     *
     * @param {number} tankId - The id of the tank
     * @param {string} username - The player username
     *
     * @return {boolean} - True if another tanks is the good answer, false otherwise
     */
    private isAnotherTanks(tankId: number, username: string): boolean {
        const { allTanks, selectedTanks } = this.getData(username);
        const vehicle: Tank | undefined = allTanks!.find((vehicle: Tank): boolean => vehicle.id === tankId);

        if (!vehicle) {
            return false;
        }

        return this.checkVehicleAmmoDetail(vehicle.ammo[selectedTanks.ammoIndex], selectedTanks.tank.ammo[selectedTanks.ammoIndex]);
    }

    /**
     * Updates the statistic after a player has completed a trivia game.
     *
     * @param {boolean} isGoodAnswer - Indicates whether the player's final answer is correct or not.
     * @param {string} username - The username of the player.
     * @param {PlayerAnswer} [playerAnswer] - The player's final answer.
     */
    private async updateStatistic(isGoodAnswer: boolean, username: string, playerAnswer?: PlayerAnswer): Promise<void> {
        this.logger.debug('Start updating {} statistic', username);
        await this.updatePlayerStatistic(username, isGoodAnswer, playerAnswer);
        this.datum.delete(username);
        this.logger.debug('End updating {} statistic', username);
    }

    /**
     * Updates the player statistics after they have answered a trivia question.
     *
     * @param {string} playerName - The name of the player whose statistics need to be updated.
     * @param {boolean} isGoodAnswer - Indicates whether the player's answer is correct or not.
     * @param {PlayerAnswer} [playerAnswer] - The answer provided by the player.
     */
    private async updatePlayerStatistic(playerName: string, isGoodAnswer: boolean, playerAnswer?: PlayerAnswer): Promise<void> {
        const value = this.datum.get(playerName);

        if (!value) {
            return;
        }

        const { allTanks, selectedTanks } = this.getData(playerName);
        const lastAnswer: TriviaAnswer | undefined = await this.playerAnswerTable.getLastAnswerOfPlayer(value.player.id);
        const oldElo = lastAnswer?.elo ?? 0;
        const elo = this.calculateElo(oldElo, isGoodAnswer, playerAnswer?.responseTime);

        try {
            await this.playerAnswerTable.addAnswer(
                value.player.id,
                selectedTanks.id,
                new Date(),
                isGoodAnswer,
                elo,
                playerAnswer?.responseTime
            );

            this.logger.info('Successfully add player {} answer in database', playerName);
        } catch (reason) {
            if (playerAnswer?.interaction) {
                await playerAnswer.interaction.editReply({
                    content: "Une erreur est survenue lors de l'enregistrement de ta réponse dans la base de données !",
                });
            }
            this.logger.error(transformToCode(`Failed to add answer of player {} in database, with error {}`, playerName, reason));
            return;
        }

        let winStreak: WinStreak | undefined = await this.winStreakTable.getWinStreakFromDate(value.player.id, new Date());

        if (!winStreak) {
            try {
                winStreak = await this.addWinStreak(playerName, value.player.id, playerAnswer?.interaction);
            } catch (reason) {
                if (playerAnswer?.interaction) {
                    await playerAnswer.interaction.editReply({
                        content: 'Une erreur est survenue lors de la création de tes statistiques dans la base de données !',
                    });
                }
                this.logger.error(
                    transformToCode(`Failed to create winstreak for player {} in database, with error {}`, playerName, reason)
                );
                return;
            }
        }

        if (isGoodAnswer) {
            await this.handleGoodAnswer(winStreak, oldElo, elo, playerName, playerAnswer);
        } else {
            await this.handleWrongAnswer(winStreak, oldElo, elo, playerName, allTanks!, selectedTanks, playerAnswer);
        }
    }

    /**
     * Calculates the new elo of the player after he answered a question
     *
     * @param {number} oldElo - The player's original elo
     * @param {boolean} isGoodAnswer - If the player answer is a good response or not
     * @param {number} [responseTime] - The player's response time of the actual question
     *
     * @return {number} - The new elo of the player
     */
    private calculateElo(oldElo: number, isGoodAnswer: boolean, responseTime?: number): number {
        let gain = -Math.floor(25 * Math.exp(0.001 * oldElo));
        if (isGoodAnswer) {
            gain = Math.floor(50 * Math.exp(-0.001 * oldElo));

            if (typeof responseTime === 'number' && responseTime <= this.responseTimeLimit) {
                gain += Math.floor(gain * 0.25);
            }
        }

        return Math.max(0, oldElo + gain);
    }

    /**
     * Handle the logic when the player found the right answer
     *
     * @param {{ current: number; max: number }} winStreak - The player win streak
     * @param {number} oldElo - The player elo before the answer
     * @param {number} newElo - The player elo after the answer
     * @param {string} playerName - The player username
     * @param {PlayerAnswer} [playerAnswer] - The player answer
     */
    private async handleGoodAnswer(
        winStreak: WinStreak,
        oldElo: number,
        newElo: number,
        playerName: string,
        playerAnswer?: PlayerAnswer
    ): Promise<void> {
        const value = this.datum.get(playerName);

        if (!value) {
            return;
        }

        winStreak.current++;
        winStreak.max = Math.max(winStreak.current, winStreak.max);

        await this.updateWinStreak(playerName, winStreak, playerAnswer);

        await playerAnswer?.interaction.editReply({
            content: '',
            embeds: [
                new EmbedBuilder()
                    .setTitle(':clap: Bonne réponse :clap:')
                    .setDescription('Bravo a trouvée la bonne réponse')
                    .setColor(Colors.Green)
                    .setFooter({ text: 'Trivia Game' })
                    .setFields({ name: 'Elo', value: `Ton nouvelle elo est : \`${newElo}\` (modification de \`${newElo - oldElo}\`)` }),
            ],
        });
        this.logger.debug('Player {} found the right answer', playerName);
    }

    /**
     * handle the logic when the player haven't answered or found the answer
     *
     * @param {{ current: number; max: number }} winStreak - The player win streak
     * @param {number} oldElo - The player elo before the answer
     * @param {number} newElo - The player elo after the answer
     * @param {string} playerName - The player username
     * @param {Tank[]} allTanks - All the tanks available for the question
     * @param {TriviaSelected} datum - The tank selected for the question
     * @param {PlayerAnswer} [playerAnswer] - The player answer
     */
    private async handleWrongAnswer(
        winStreak: WinStreak,
        oldElo: number,
        newElo: number,
        playerName: string,
        allTanks: Tank[],
        datum: TriviaSelected,
        playerAnswer?: PlayerAnswer
    ): Promise<void> {
        this.logger.debug('Player {} failed to find the right answer', playerName);

        winStreak.current = 0;
        await this.updateWinStreak(playerName, winStreak, playerAnswer);

        if (!playerAnswer) {
            return;
        }

        const value = this.datum.get(playerName);

        if (!value) {
            return;
        }

        const tank = allTanks.find((tank: Tank): boolean => tank.name === playerAnswer.response.split('#')[0]);

        if (!tank) {
            return;
        }

        const ammo = tank.ammo[datum.ammoIndex];
        await playerAnswer.interaction.editReply({
            content: '',
            embeds: [
                new EmbedBuilder()
                    .setTitle(':muscle: Mauvaise réponse :muscle:')
                    .setDescription("Tu n'a malheureusement pas trouvée la bonne réponse")
                    .setColor(Colors.Red)
                    .setFooter({ text: 'Trivia Game' })
                    .setImage(tank.image)
                    .setFields(
                        { name: 'Char sélectionné', value: `\`${tank.name}\``, inline: true },
                        {
                            name: "Catégorie d'obus",
                            value: `\`${datum.ammoIndex ? ShellType.GOLD : ShellType.NORMAL} \``,
                            inline: true,
                        },
                        {
                            name: 'Obus',
                            value: `\`${ShellEnum[ammo.type as keyof typeof ShellEnum]} ${ammo.damage[1]}\``,
                            inline: true,
                        },
                        { name: 'Elo', value: `Ton nouvelle elo est : \`${newElo}\` (modification de \`${newElo - oldElo}\`)` }
                    ),
            ],
        });
    }

    /**
     * Updates the winstreak for a player in the database.
     *
     * @param {string} playerName - The name of the player.
     * @param {WinStreak} winStreak - The player's current winstreak data.
     * @param {PlayerAnswer} [playerAnswer] - The interaction object of the player's answer.
     */
    private async updateWinStreak(playerName: string, winStreak: WinStreak, playerAnswer?: PlayerAnswer): Promise<void> {
        const value = this.datum.get(playerName);

        if (!value) {
            return;
        }

        try {
            await this.winStreakTable.updateWinStreak(value.player.id, new Date(), winStreak);
            this.logger.info('Successfully update winstreak for player {} in database', playerName);
        } catch (reason) {
            if (playerAnswer) {
                await playerAnswer.interaction.editReply({
                    content: 'Une erreur est survenue lors de la mise à jour de tes statistiques dans la base de données !',
                });
            }
            this.logger.error(transformToCode(`Failed to update winstreak for player {} in database, with error {}`, playerName, reason));
            return;
        }
    }

    /**
     * Add the player to the database
     *
     * @param {string} playerName - The player name
     *
     * @return {TriviaPlayer} - The player if the put is successful
     *
     * @throws {Error} - If the sql query failed
     */
    private async addPlayer(playerName: string): Promise<TriviaPlayer> {
        const added = await this.playersTable.addPlayer(playerName);

        if (!added) {
            throw new Error('Return false');
        }

        this.logger.info('New player added to trivia database {}', playerName);
        return (await this.playersTable.getPlayerByName(playerName))!;
    }

    /**
     * Create the win streak line in the database for the given player
     *
     * @param {string} playerName - The player name
     * @param {number} playerId - The id of the player in the database
     * @param {ButtonInteraction} [interaction] - The interaction to replay if error
     *
     * @return {WinStreak} - The win streak object initialise
     */
    private async addWinStreak(playerName: string, playerId: number, interaction?: ButtonInteraction): Promise<WinStreak> {
        const added = await this.winStreakTable.addWinStreak(playerId);

        if (!added && interaction) {
            await interaction.editReply({
                content: 'Une erreur est survenue lors de la création de tes statistiques dans la base de données !',
            });
            throw new Error(transformToCode(`Failed to create winstreak for player {} in database`, playerName));
        }

        this.logger.info('Successfully create winstreak for player {} in database', playerName);
        return { max: 0, current: 0 } as WinStreak;
    }
}
