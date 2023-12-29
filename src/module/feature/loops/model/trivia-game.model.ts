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
import { TankopediaVehiclesSuccess, VehicleData } from '../types/wot-api.type';
import { WotApiModel } from './wot-api.model';
import { StatisticSingleton } from 'src/module/shared/singleton/statistic.singleton';
import {
    MonthlyTriviaOverallStatisticType,
    MonthlyTriviaPlayerStatisticType,
    TriviaPlayerStatisticType,
    TriviaStatisticType,
} from '../../../shared/types/statistic.type';
import { ShellEnum } from '../enums/shell.enum';

@LoggerInjector
@InventoryInjector
@StatisticInjector
export class TriviaGameModel {
    /**
     * The data for the trivia
     * @private
     */
    private trivia: TriviaType;
    /**
     * @instance Of the discord text channel
     * @private
     */
    private channel: TextChannel;
    /**
     * All the tanks for the game
     * @private
     */
    private allTanks: VehicleData[];
    /**
     * The selected tanks
     * @private
     */
    private datum: VehicleData;
    /**
     * The message send
     * @private
     */
    private gameMessage: Message<true>;
    /**
     * The timer of the game
     * @private
     */
    private timer: number;
    /**
     * Follow the player answer
     * @private
     */
    private playerAnswer: {
        [key: string]: {
            responseTime: number;
            response: string;
            interaction: ButtonInteraction<'cached'>;
        };
    } = {};
    /**
     * The tracking variable for the trivia game
     * @private
     */
    private triviaStats: TriviaStatisticType;

    /**
     * Define the max play time
     */
    public readonly MAX_TIME: number = 1000 * 60;

    /**
     * The medal for the player
     * @private
     */
    private readonly MEDAL: string[] = ['🥇', '🥈', '🥉'];
    /**
     * @instance Of the logger
     * @private
     */
    private readonly logger: Logger;
    /**
     * @instance Of the inventory
     * @private
     */
    private readonly inventory: InventorySingleton;
    /**
     * @instance Of the wot api
     * @private
     */
    private readonly wotApi: WotApiModel = new WotApiModel();
    /**
     * The embed for the start game message
     * @private
     */
    private readonly startGameEmbed: EmbedBuilder = new EmbedBuilder().setTitle('Trivia Game').setColor(Colors.Aqua);
    /**
     * The embed for the game result
     * @private
     */
    private readonly answerEmbed: EmbedBuilder = new EmbedBuilder().setTitle('Trivia Game : RÉSULTAT').setColor(Colors.Green);
    /**
     * @instance Of the axios
     * @private
     */
    private readonly statisticSingleton: StatisticSingleton;

    /**
     * Fetch the instance of the text channel,
     * Initialize the trivia from {@link InventorySingleton},
     * Initialize the trivia statistic from the {@link StatisticSingleton}
     * @param client The client instance of the bot
     */
    public async fetchMandatory(client: Client): Promise<void> {
        this.channel = await this.inventory.getChannelForTrivia(client);
        this.trivia = this.inventory.trivia;
        this.triviaStats = this.statisticSingleton.trivia;
    }

    /**
     * Call the WoT api to fetch the 4 tanks for the game
     * @throws Error if fetching send error
     */
    public async fetchTanks(): Promise<void> {
        this.logger.trace('Start fetching tanks');
        const pages: number[] = RandomUtil.getArrayWithRandomNumber(4, this.trivia.limit, 1);
        const tankopediaResponses: TankopediaVehiclesSuccess[] = [];

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

        this.datum = this.allTanks[RandomUtil.getRandomNumber(this.allTanks.length - 1)];
        this.logger.trace(`Tank for game selected : \`${this.datum.name}\``);
    }

    /**
     * Send the game message to the channel
     */
    public async sendMessageToChannel(): Promise<void> {
        this.startGameEmbed.setFields(
            {
                name: ' Règle du jeu',
                value: "Les règles sont simple :\n\t - ✏ 1 obus,\n- 🚗 4 chars  tier X (⚠️Quand 2 ou plusieurs chars on le même obus, tous ces chars sont des bonnes responses),\n- ✔ 1 bonne réponse ,\n- 🕒 1 minute.\n**⚠️ Ce n'est pas forcèment le dernier canon utilisé !**",
            },
            {
                name: 'Obus :',
                value: `\`${ShellEnum[this.datum.default_profile.ammo[0].type as keyof typeof ShellEnum]} ${
                    this.datum.default_profile.ammo[0].damage[1]
                }\``,
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
        this.logger.trace('Trivia game message send to the guild');
        this.timer = Date.now();
    }

    /**
     * Collect the player answer during the play time
     */
    public async collectAnswer(): Promise<void> {
        this.logger.trace('Collecting player answer start');
        this.playerAnswer = {};
        this.gameMessage
            .createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: this.MAX_TIME,
            })
            .on('collect', async (interaction: ButtonInteraction<'cached'>): Promise<void> => {
                this.logger.trace(
                    `${interaction.member.nickname ?? interaction.user.displayName} answer to the trivia game with : \`${
                        interaction.customId
                    }\``
                );
                this.playerAnswer[interaction.user.username] = {
                    responseTime: Date.now() - this.timer,
                    response: interaction.customId,
                    interaction: interaction,
                };
                await interaction.reply({
                    ephemeral: true,
                    content: `Ta réponse \`${interaction.customId}\` à bien été pris en compte !`,
                });
            });
    }

    /**
     * Update the game message to show the answer and display top 3 players
     */
    public async sendAnswerToChannel(): Promise<void> {
        this.logger.trace('Collect answer end. Start calculating the scores');
        const playersResponse: [string, any][] = Object.entries(this.playerAnswer).sort(
            (a: [string, any], b: [string, any]) => a[1].responseTime - b[1].responseTime
        );

        this.answerEmbed.setImage(this.datum.images.big_icon).setDescription(`Le char à deviner était : \`${this.datum.name}\``);
        const otherAnswer: string[] = ['Les autres bonnes réponses sont :'];
        this.allTanks.forEach((vehicle: VehicleData): void => {
            if (
                vehicle.name !== this.datum.name &&
                vehicle.default_profile.ammo[0].type === this.datum.default_profile.ammo[0].type &&
                vehicle.default_profile.ammo[0].damage[1] === this.datum.default_profile.ammo[0].damage[1]
            ) {
                otherAnswer.push(vehicle.name);
            }
        });
        this.answerEmbed.setFields([]);
        if (otherAnswer.length > 1) {
            this.answerEmbed.setFields({ name: 'Autre bonne réponses :', value: otherAnswer.join('\n') });
        }

        let description: string = playersResponse.length > 0 ? '' : "Aucun joueur n'a envoyé de réponse !";

        for (let i = 0; i < 3; i++) {
            if (playersResponse[i] && this.isGoodAnswer(playersResponse[i])) {
                description += `${this.MEDAL[i]} ${playersResponse[i][0]} en ${playersResponse[i][1].responseTime / 1000} secondes\n`;
            }
        }

        description = description ? description : "Aucun joueur n'a trouvé la bonne réponse !";

        const playerEmbed: EmbedBuilder = new EmbedBuilder()
            .setTitle('Joueurs')
            .setDescription(description)
            .setColor(playersResponse.length === 0 ? Colors.Red : Colors.Gold);

        await this.gameMessage.edit({ embeds: [this.answerEmbed, playerEmbed], components: [] });
        this.logger.trace('Game message update with answer and top 3 players');

        this.updateStatistic(playersResponse);
    }

    /**
     * Check is the answer of the player is the good one.
     * @param playerResponse The player response
     * @private
     */
    private isGoodAnswer(playerResponse: [string, any]): boolean {
        return playerResponse[1].response === this.datum.name || this.isAnotherTanks(playerResponse);
    }

    /**
     * This method check if there are another tanks that have the same shell (damage and type)
     * @param playerResponse The answer of the player
     * @private
     */
    private isAnotherTanks(playerResponse: [string, any]): boolean {
        const vehicle: VehicleData | undefined = this.allTanks.find(
            (vehicle: VehicleData): boolean => vehicle.name === playerResponse[1].response
        );

        if (!vehicle) {
            return false;
        }

        return (
            vehicle.default_profile.ammo[0].type === this.datum.default_profile.ammo[0].type &&
            vehicle.default_profile.ammo[0].damage[1] === this.datum.default_profile.ammo[0].damage[1]
        );
    }

    /**
     * Update the trivia game statistic
     * @param responses The response of all the players
     * @private
     */
    private updateStatistic(responses: [string, any][]): void {
        this.logger.trace('Start updating the overall statistics');
        const overall: MonthlyTriviaOverallStatisticType = this.triviaStats.overall[this.statisticSingleton.currentMonth] ?? {
            number_of_game: 0,
            game_without_participation: 0,
        };

        overall.number_of_game++;

        if (responses.length === 0) {
            overall.game_without_participation++;
        }
        this.triviaStats.overall[this.statisticSingleton.currentMonth] = overall;

        this.logger.trace("Start updating the player's statistics");
        responses.forEach((response: [string, any]): void => {
            this.logger.trace(`Start updating ${response[0]} statistic`);
            const player: TriviaPlayerStatisticType = this.triviaStats.player[response[0]] ?? {};

            const playerStat: MonthlyTriviaPlayerStatisticType = player[this.statisticSingleton.currentMonth]
                ? player[this.statisticSingleton.currentMonth]
                : { elo: 0, right_answer: 0, win_strick: 0, answer_time: [], participation: 0 };
            playerStat.participation++;
            playerStat.answer_time.push(response[1].responseTime);

            if (this.isGoodAnswer(response)) {
                playerStat.right_answer++;
                playerStat.win_strick++;
                response[1].interaction.editReply({ content: 'Ta réponse était la bonne :)' });
                this.logger.trace(`Player ${response[0]} found the right answer`);
            } else {
                playerStat.win_strick = 0;
                response[1].interaction.editReply({ content: "Ta réponse n'était pas la bonne :(" });
                this.logger.trace(`Player ${response[0]} failed to find the right answer`);
            }

            playerStat.elo = this.calculateElo(playerStat, response);

            player[this.statisticSingleton.currentMonth] = playerStat;
            this.triviaStats.player[response[0]] = player;
            this.logger.trace(`End updating ${response[0]} statistic`);
        });

        this.statisticSingleton.trivia = this.triviaStats;
    }

    /**
     * Calculate the elo of the player.
     * @param playerStat The stats of the player
     * @param response The response of the player
     * @private
     */
    private calculateElo(playerStat: MonthlyTriviaPlayerStatisticType, response: [string, any]): number {
        let K: number = 1 / (response[1].responseTime / 10000) * (playerStat.win_strick + 1);
        let Ea: number = 1 / (1 + Math.pow(10, playerStat.elo / 400));
        let Ro: number = 0;
        if (this.isGoodAnswer(response)) {
            Ro = 1;
        }
        const elo: number = playerStat.elo + K * (Ro - Ea);
        return elo < 0 ? 0 : elo;
    }
}
