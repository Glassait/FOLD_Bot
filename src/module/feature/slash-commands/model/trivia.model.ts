import {
    ActionRowBuilder,
    BooleanCache,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
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
import { EmojiEnum } from '../../../shared/enums/emoji.enum';
import { ShellEnum, ShellType } from '../enums/shell.enum';
import { InventoryInjector, LoggerInjector, StatisticInjector, TriviaInjector } from '../../../shared/decorators/injector.decorator';
import { TriviaSingleton } from '../../../shared/singleton/trivia.singleton';
import { TimeEnum } from '../../../shared/enums/time.enum';
import { Ammo, VehicleData } from '../../../shared/types/wot-api.type';
import { Logger } from '../../../shared/classes/logger';
import { TimeUtil } from '../../../shared/utils/time.util';
import { PlayerAnswer } from '../types/trivia-game.type';
import {
    DailyTrivia,
    MonthlyTriviaPlayerStatisticType,
    TriviaPlayerStatisticType,
    TriviaStatistic,
    WinStreak,
} from '../../../shared/types/statistic.type';
import { TriviaSelected } from '../../../shared/types/trivia.type';
import { StatisticSingleton } from '../../../shared/singleton/statistic.singleton';
import { InventorySingleton } from 'src/module/shared/singleton/inventory.singleton';
import { MEDAL } from '../../../shared/utils/variables.util';

@LoggerInjector
@TriviaInjector
@StatisticInjector
@InventoryInjector
export class TriviaModel {
    //region INJECTION
    private readonly trivia: TriviaSingleton;
    private readonly logger: Logger;
    private readonly statistic: StatisticSingleton;
    private readonly inventory: InventorySingleton;
    //endregion

    //region PRIVATE READONLY FIELDS
    /**
     * Embed containing all the information for the rule command
     */
    private readonly embedRule: EmbedBuilder = new EmbedBuilder()
        .setColor(Colors.Orange)
        .setTitle('Voici les règles concernant le jeu trivia')
        .setThumbnail(
            'https://img.poki.com/cdn-cgi/image/quality=78,width=600,height=600,fit=cover,f=auto/8fe1b52b0dce26510d0ebf4cbb484aaf.png'
        )
        .setFields(
            {
                name: 'But',
                value: "Ce jeu vise à t'aider à mémoriser les dégâts moyens et le type d'obus des chars de rang 10 dans World of Tanks.",
            },
            {
                name: 'Commande',
                value: "Le jeu `trivia` peut-être lancé avec la commande `/trivia game` dans n'importe quel salon textuel. Toutefois, il ne peut pas être lancé que `4 fois par jour`. Lorsque tu démarres un trivia, le bot t'envoie un message visible uniquement par toi contenant les informations suivantes :",
            },
            {
                name: 'Obus',
                value: `Affichant son \`type\` (AP, APCR, etc) et son \`dégât moyen (alpha)\`, l'obus peut être un obus \`standard\` ou un obus \`spécial\` (ou gold). **${EmojiEnum.WARNING} Le bot ne récupère actuellement que le premier canon des chars, alors sois attentif aux chars tels que l'IS-4, l'AMX M4 54, et autres !**`,
            },
            {
                name: 'Minuteur',
                value: "Tu as `1 minute` pour répondre à la question. À la fin du minuteur, le bot t'enverra ton résultat : bonne ou mauvaise réponse ainsi que les informations sur le char à trouver et sur le char que tu as sélectionné.",
            },
            {
                name: 'Bouton',
                value: `Le message sera suivi de \`quatre boutons cliquables\`. Chaque bouton représente un char rang 10 sélectionné aléatoirement. Pour répondre, il te suffit de cliquer sur l'un des boutons. Tu peux changer de réponse tant que le minuteur n'est pas terminé. **${EmojiEnum.WARNING} ️Quand 2 ou plusieurs chars ont le même obus (type et alpha), tous ces chars sont considérés comme la réponse.**`,
            },
            {
                name: 'Sommaire',
                value: 'Tous les jours, au lancement du bot, un sommaire sera envoyé. Il contient le top 5 des joueurs pour chaque question en terme de vitesse de réponse, ainsi que la bonne réponse et des informations sur les autres chars.',
            },
            {
                name: 'AFK',
                value: "En cas d'absence de jeu pendant une journée, une perte de `1.8% de vos points` sera appliquée.",
            }
        );
    /**
     * Embed use as exemple for the rule command
     */
    private readonly embedExample: EmbedBuilder = new EmbedBuilder()
        .setTitle('Example de question')
        .setColor(Colors.Blurple)
        .setFields(
            {
                name: `Obus :`,
                value: `\`${ShellEnum.ARMOR_PIERCING} 390\``,
                inline: true,
            },
            {
                name: 'Minuteur :',
                value: 'Le temps sera ici',
                inline: true,
            }
        );
    /**
     *
     */
    private readonly rowExample: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(new ButtonBuilder().setCustomId('Object 140').setLabel('Object 140').setStyle(ButtonStyle.Primary))
        .addComponents(new ButtonBuilder().setCustomId('Manticore').setLabel('Manticore').setStyle(ButtonStyle.Primary))
        .addComponents(new ButtonBuilder().setCustomId('Object 268').setLabel('Object 268').setStyle(ButtonStyle.Primary))
        .addComponents(new ButtonBuilder().setCustomId('Object 907').setLabel('Object 907').setStyle(ButtonStyle.Primary));
    //endregion

    //region PRIVATE FIELDS
    /**
     * The maximum duration of a trivia question
     * @unit minute
     */
    private maxQuestionDuration: number;
    /**
     * The maximum time to get extra point for the trivia game
     * @unit second
     */
    private responseTimeLimit: number;
    /**
     * The information stored in the statistique about the trivia game
     */
    private triviaStatistic: TriviaStatistic;
    /**
     * The map of all players with there metadata
     */
    private datum: Map<
        string,
        {
            daily: DailyTrivia;
            stats: MonthlyTriviaPlayerStatisticType;
            interaction: ChatInputCommandInteraction;
        }
    >;
    //endregion

    /**
     * Initialize the class
     */
    public initialize(): void {
        this.maxQuestionDuration = TimeEnum.MINUTE * this.inventory.trivia.max_duration_of_question;
        this.responseTimeLimit = TimeEnum.SECONDE * this.inventory.trivia.max_response_time_limit;
        this.triviaStatistic = this.statistic.trivia;
        this.datum = new Map();
    }

    /**
     * Callback for the rule commande, send the rule to the player in ephemeral message
     *
     * @param {ChatInputCommandInteraction} interaction - The chat interaction of the player
     */
    public async sendRule(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.editReply({ embeds: [this.embedRule, this.embedExample], components: [this.rowExample] });
    }

    /**
     * Callback for the game commande, send the game to the player in ephemeral message
     *
     * @param {ChatInputCommandInteraction} interaction - The chat interaction of the player
     */
    public async sendGame(interaction: ChatInputCommandInteraction): Promise<void> {
        this.statistic.initializeTriviaMonth(interaction.user.username);

        if (
            this.triviaStatistic.player[interaction.user.username][this.statistic.currentMonth].daily[this.statistic.currentDay]
                ?.participation >= this.inventory.trivia.max_number_of_question
        ) {
            await interaction.editReply({
                content: `Tu as atteint le nombre maximum de question par jour ! (actuellement ${this.inventory.trivia.max_number_of_question} par jour)\nReviens demain pour pouvoir rejouer !`,
            });
            return;
        }

        if (this.datum.get(interaction.user.username)) {
            await interaction.editReply({
                content: `Tu as déjà une parti de trivia en cours ! Merci d'attendre que la partie précédente ce termine avant de lancer une nouvelle partie`,
            });
            return;
        }

        const value = {
            daily:
                this.triviaStatistic.player[interaction.user.username][this.statistic.currentMonth].daily[this.statistic.currentDay] || {},
            stats: this.triviaStatistic.player[interaction.user.username][this.statistic.currentMonth],
            interaction: interaction,
        };

        this.datum.set(interaction.user.username, value);

        const { allTanks, datum } = this.getData(interaction.user.username);

        if (!allTanks || allTanks.length === 0) {
            await interaction.editReply({
                content: `Le jeu ne semble pas encore initialisé, merci de réessayer dans quelque minutes. Si le problème persist merci de contacter <@313006042340524033>`,
            });
            return;
        }

        const ammo: Ammo = datum.tank.default_profile.ammo[datum.ammoIndex];

        const target = new Date();
        target.setMinutes(target.getMinutes() + this.maxQuestionDuration / TimeEnum.MINUTE);

        const startGameEmbed: EmbedBuilder = new EmbedBuilder()
            .setTitle('Devine le bon char')
            .setFooter({ text: 'Trivia Game' })
            .setDescription(
                `Tu es entrain de répondre à la question n°\`${value.daily.participation + 1 || 1}\` sur ${
                    this.inventory.trivia.max_number_of_question
                }`
            )
            .setColor(Colors.Blurple)
            .setFields(
                {
                    name: '💥 Obus :',
                    value: `\`${ShellEnum[ammo.type as keyof typeof ShellEnum]} ${ammo.damage[1]}\``,
                    inline: true,
                },
                {
                    name: '🕒 Minuteur :',
                    value: `<t:${TimeUtil.convertToUnix(target)}:R>`,
                    inline: true,
                }
            );

        const row: ActionRowBuilder<ButtonBuilder> = allTanks.reduce((rowBuilder: ActionRowBuilder<ButtonBuilder>, data: VehicleData) => {
            rowBuilder.addComponents(new ButtonBuilder().setCustomId(`${data.name}`).setLabel(data.name).setStyle(ButtonStyle.Primary));
            return rowBuilder;
        }, new ActionRowBuilder<ButtonBuilder>());

        const gameMessage: Message<BooleanCache<CacheType>> = await interaction.editReply({
            embeds: [startGameEmbed],
            components: [row],
        });
        this.logger.debug('Trivia game message send to {}', interaction.user.username);

        await this.collectAnswer(gameMessage, interaction.user.username);
    }

    /**
     * Sends the trivia statistics for a specific month to the user.
     *
     * @param {ChatInputCommandInteraction} interaction - The interaction object representing the user command.
     */
    public async sendStatistics(interaction: ChatInputCommandInteraction): Promise<void> {
        const playerStats = this.triviaStatistic.player[interaction.user.username];

        if (!playerStats) {
            await interaction.editReply({
                content:
                    "Tu n'as pas encore de statistiques pour le jeu Trivia. Essaye après avoir répondu au moins une fois au jeu. (`/trivia game`)",
            });
            return;
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
                        {
                            name: 'Nombre de bonnes réponses',
                            value: `\`${Object.values(stats.daily).reduce((number: number, currentValue: DailyTrivia) => {
                                number += currentValue.right_answer;
                                return number;
                            }, 0)}\``,
                            inline: true,
                        },
                        { name: 'Plus longue séquence correcte', value: `\`${stats.win_streak.max}\`` },
                        {
                            name: 'Réponse la plus rapide',
                            value: `\`${
                                Math.min(...Object.values(stats.daily).flatMap((daily: DailyTrivia) => daily.answer_time)) /
                                TimeEnum.SECONDE
                            }\` sec`,
                            inline: true,
                        },
                        {
                            name: 'Réponse la plus longue',
                            value: `\`${
                                Math.max(...Object.values(stats.daily).flatMap((daily: DailyTrivia) => daily.answer_time)) /
                                TimeEnum.SECONDE
                            }\` sec`,
                            inline: true,
                        },
                        {
                            name: 'Nombre de participation',
                            value: `\`${Object.values(stats.daily).reduce((number: number, currentValue: DailyTrivia) => {
                                number += currentValue.participation;
                                return number;
                            }, 0)}\``,
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
     */
    public async sendScoreboard(interaction: ChatInputCommandInteraction): Promise<void> {
        const username = interaction.user.username;
        const embedScoreboard = new EmbedBuilder()
            .setTitle('Scoreboard')
            .setDescription(`Voici le scoreboard du mois de \`${this.statistic.currentMonth}\` pour le jeu trivia`)
            .setFooter({ text: 'Trivia game' })
            .setColor(Colors.Fuchsia);

        if (Object.values(this.triviaStatistic.player).length === 0) {
            await interaction.editReply({
                content: "Aucun joueur n'a pour l'instant joué au jeu",
            });
            return;
        }

        const playerStats = Object.entries(this.triviaStatistic.player)
            .filter((player: [string, TriviaPlayerStatisticType]) => player[1][this.statistic.currentMonth])
            .sort(
                (a: [string, TriviaPlayerStatisticType], b: [string, TriviaPlayerStatisticType]) =>
                    b[1][this.statistic.currentMonth].elo - a[1][this.statistic.currentMonth].elo
            );

        if (playerStats.length === 0) {
            await interaction.editReply({
                content: "Aucun joueur n'a pour l'instant joué ce mois si au jeu",
            });
            return;
        }

        embedScoreboard.addFields({
            name: 'Joueur - Elo',
            value: playerStats
                .map(
                    (player: [string, TriviaPlayerStatisticType], index: number): string =>
                        `${username === player[0] ? '`--> ' : ''}${index < 3 ? MEDAL[index] : index + 1}. ${player[0]} - ${
                            player[1][this.statistic.currentMonth].elo
                        }${username === player[0] ? ' <--`' : ''}`
                )
                .join('\n'),
            inline: true,
        });

        await interaction.editReply({
            embeds: [embedScoreboard],
        });
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
    private getData(username: string): { allTanks: VehicleData[]; datum: TriviaSelected } {
        const value = this.datum.get(username);

        return {
            allTanks: this.trivia.allTanks[value?.daily.participation ?? 0],
            datum: this.trivia.datum[value?.daily.participation ?? 0],
        };
    }

    /**
     * Collects the answers from the players from his interaction with the button.
     *
     * @param {Message<BooleanCache<CacheType>>} gameMessage - The message send to the channel via interaction reply
     * @param {string} username - The username of the player
     */
    private async collectAnswer(gameMessage: Message<BooleanCache<CacheType>>, username: string): Promise<void> {
        this.logger.debug('Start collecting answer of {}', username);
        const timer = Date.now();
        let playerAnswer: PlayerAnswer;

        gameMessage
            .createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: this.maxQuestionDuration,
            })
            .on('collect', async (interaction: ButtonInteraction<'cached'>): Promise<void> => {
                try {
                    let hasAlreadyAnswer: boolean = !!playerAnswer?.interaction;
                    let changedAnswer: boolean = false;

                    if (hasAlreadyAnswer) {
                        await interaction.deferUpdate();
                    } else {
                        await interaction.deferReply({ ephemeral: true });
                    }

                    if (!hasAlreadyAnswer || playerAnswer.response !== interaction.customId) {
                        playerAnswer = {
                            responseTime: Date.now() - timer,
                            response: interaction.customId,
                            interaction: playerAnswer?.interaction ?? interaction,
                        };

                        await playerAnswer.interaction?.editReply({
                            content: hasAlreadyAnswer
                                ? `Ta réponse a été mise à jour en \`${interaction.customId}\``
                                : `Ta réponse \`${interaction.customId}\` a été enregistrée !`,
                        });

                        changedAnswer = true;
                    } else {
                        await playerAnswer.interaction?.editReply({
                            content: `Ta réponse semble être la même que celle que tu as sélectionnée précédemment.`,
                        });
                    }

                    this.logCollect(hasAlreadyAnswer, changedAnswer, interaction);
                } catch (error) {
                    this.logger.error(`Error during collecting player answer : ${error}`, error);
                }
            })
            .on('end', async (): Promise<void> => {
                this.logger.debug('Collect answer of {} end. Start calculating the scores', username);
                await this.sendAnswerToPlayer(playerAnswer, username);
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
            interaction.member?.nickname ?? interaction.user.displayName,
            interaction.customId
        );
    }

    /**
     * Send the answer to the player
     *
     * @param {PlayerAnswer} playerAnswer - The player answer
     * @param {string} username - The player name
     */
    private async sendAnswerToPlayer(playerAnswer: PlayerAnswer, username: string): Promise<void> {
        const { interaction } = this.datum.get(username) || {};
        const { allTanks, datum } = this.getData(username);

        const isGoodAnswer = this.isGoodAnswer(playerAnswer, username);

        const answerEmbed: EmbedBuilder = this.createAnswerEmbed(true, datum.tank, isGoodAnswer);

        const otherAnswer: EmbedBuilder[] = [];

        const ammo: Ammo = datum.tank.default_profile.ammo[datum.ammoIndex];

        allTanks.forEach((vehicle: VehicleData): void => {
            const vehicleAmmo: Ammo = vehicle.default_profile.ammo[datum.ammoIndex];
            if (vehicle.name !== datum.tank.name && this.checkVehicleAmmoDetail(vehicleAmmo, ammo)) {
                this.logger.debug(`Another tank has the same shell {}`, vehicle.name);
                otherAnswer.push(this.createAnswerEmbed(false, vehicle, isGoodAnswer));
            }
        });

        await interaction?.editReply({ embeds: [answerEmbed, ...otherAnswer], components: [] });
        this.logger.debug("Game's message update with answer");

        await this.updateStatistic(playerAnswer, isGoodAnswer, username);
    }

    /**
     * Create the answer embed to send to the player.
     *
     * @param {boolean} main - If this is the main answer or not
     * @param {VehicleData} vehicle - The data of the tank
     * @param {boolean} isGoodAnswer - Is the player found the right answer or not
     *
     * @return {EmbedBuilder} - The response embed build by the bot to send to the player
     *
     * @example
     * const embed = this.createAnswerEmbed(true, {...}, true);
     * console.log(embed) // Embed{ title: "Réponse principale", color: Colors.Red, etc. }
     */
    private createAnswerEmbed(main: boolean, vehicle: VehicleData, isGoodAnswer: boolean): EmbedBuilder {
        return new EmbedBuilder()
            .setTitle(main ? 'Réponse principale' : 'Autre bonne réponse')
            .setColor(isGoodAnswer ? Colors.Green : Colors.Red)
            .setImage(vehicle.images.big_icon)
            .setDescription(main ? `Le char à deviner était : \`${vehicle.name}\`` : `Le char suivant \`${vehicle.name}\` à le mème obus !`)
            .setFooter({ text: 'Trivia Game' })
            .setFields(
                {
                    name: 'Obus normal',
                    value: `\`${ShellEnum[vehicle.default_profile.ammo[0].type as keyof typeof ShellEnum]} ${
                        vehicle.default_profile.ammo[0].damage[1]
                    }\``,
                    inline: true,
                },
                {
                    name: 'Obus spécial (ou gold)',
                    value: `\`${ShellEnum[vehicle.default_profile.ammo[1].type as keyof typeof ShellEnum]} ${
                        vehicle.default_profile.ammo[1].damage[1]
                    }\``,
                    inline: true,
                },
                {
                    name: 'Obus explosif',
                    value: `\`${ShellEnum[vehicle.default_profile.ammo[2].type as keyof typeof ShellEnum]} ${
                        vehicle.default_profile.ammo[2].damage[1]
                    }\``,
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
     * @param {PlayerAnswer} playerAnswer - The player answer
     * @param {string} username - The player username
     *
     * @return {boolean} - True if the player answer is the good answer, false otherwise
     */
    private isGoodAnswer(playerAnswer: PlayerAnswer, username: string): boolean {
        const { datum } = this.getData(username);
        return playerAnswer?.response === datum.tank.name || this.isAnotherTanks(playerAnswer, username);
    }

    /**
     * Check if another tanks is the good answer.
     *
     * @param {PlayerAnswer} playerResponse - The player answer
     * @param {string} username - The player username
     *
     * @return {boolean} - True if another tanks is the good answer, false otherwise
     */
    private isAnotherTanks(playerResponse: PlayerAnswer, username: string): boolean {
        const { allTanks, datum } = this.getData(username);
        const vehicle: VehicleData | undefined = allTanks.find(
            (vehicle: VehicleData): boolean => vehicle.name === playerResponse?.response
        );

        if (!vehicle) {
            return false;
        }

        return this.checkVehicleAmmoDetail(vehicle.default_profile.ammo[datum.ammoIndex], datum.tank.default_profile.ammo[datum.ammoIndex]);
    }

    /**
     * Updates the statistic after a player has completed a trivia game.
     *
     * @param {PlayerAnswer} playerAnswer - The player's final answer.
     * @param {boolean} isGoodAnswer - Indicates whether the player's final answer is correct or not.
     * @param {string} username - The username of the player.
     */
    private async updateStatistic(playerAnswer: PlayerAnswer, isGoodAnswer: boolean, username: string): Promise<void> {
        this.logger.debug(`Start updating {} statistic`, username);
        await this.updatePlayerStatistic(username, playerAnswer, isGoodAnswer);
        this.datum.delete(username);
        this.logger.debug(`End updating {} statistic`, username);
    }

    /**
     * Updates the player statistics after they have answered a trivia question.
     *
     * @param {string} playerName - The name of the player whose statistics need to be updated.
     * @param {PlayerAnswer} playerAnswer - The answer provided by the player.
     * @param {boolean} isGoodAnswer - Indicates whether the player's answer is correct or not.
     */
    private async updatePlayerStatistic(playerName: string, playerAnswer: PlayerAnswer, isGoodAnswer: boolean): Promise<void> {
        const value = this.datum.get(playerName);

        if (!value) {
            return;
        }

        const { allTanks, datum } = this.getData(playerName);

        value.daily.participation++;
        value.daily.answer.push(isGoodAnswer ? datum.tank.name : playerAnswer?.response);
        value.daily.answer_time.push(playerAnswer?.responseTime);
        value.daily.answer_date.push(new Date());

        const oldElo = value.stats.elo;
        value.stats.elo = this.calculateElo(oldElo, playerAnswer?.responseTime, isGoodAnswer);

        const winStreak = value.stats.win_streak;

        if (isGoodAnswer) {
            await this.handleGoodAnswer(winStreak, playerAnswer, oldElo, playerName);
        } else {
            await this.handleWrongAnswer(winStreak, playerAnswer, oldElo, playerName, allTanks, datum);
        }

        this.statistic.trivia = this.triviaStatistic;
    }

    /**
     * Calculates the new elo of the player after he answered a question
     *
     * @param {number} oldElo - The player's original elo
     * @param {number} responseTime - The player's response time of the actual question
     * @param {boolean} isGoodAnswer - If the player answer is a good response or not
     *
     * @return {number} - The new elo of the player
     */
    private calculateElo(oldElo: number, responseTime: number, isGoodAnswer: boolean): number {
        let gain = -Math.floor(25 * Math.exp(0.001 * oldElo));
        if (isGoodAnswer) {
            gain = Math.floor(50 * Math.exp(-0.001 * oldElo));

            if (responseTime <= this.responseTimeLimit) {
                gain += Math.floor(gain * 0.25);
            }
        }

        return Math.max(0, oldElo + gain);
    }

    /**
     * Handle the logic when the player found the right answer
     *
     * @param {{ current: number; max: number }} winStreak - The player win streak
     * @param {PlayerAnswer} playerAnswer - The player answer
     * @param {number} oldElo - The player elo before the answer
     * @param {string} playerName - The player username
     */
    private async handleGoodAnswer(winStreak: WinStreak, playerAnswer: PlayerAnswer, oldElo: number, playerName: string): Promise<void> {
        const value = this.datum.get(playerName);

        if (!value) {
            return;
        }

        value.daily.right_answer++;
        winStreak.current++;
        winStreak.max = Math.max(winStreak.current, winStreak.max);

        await playerAnswer?.interaction.editReply({
            content: '',
            embeds: [
                new EmbedBuilder()
                    .setTitle(':clap: Bonne réponse :clap:')
                    .setDescription('Bravo a trouvée la bonne réponse')
                    .setColor(Colors.Green)
                    .setFooter({ text: 'Trivia Game' })
                    .setFields({
                        name: 'Elo',
                        value: `Ton nouvelle elo est : \`${value.stats.elo}\` (modification de \`${value.stats.elo - oldElo}\`)`,
                    }),
            ],
        });
        this.logger.debug(`Player {} found the right answer`, playerName);
    }

    /**
     * handle the logic when the player haven't answered or found the answer
     *
     * @param {{ current: number; max: number }} winStreak - The player win streak
     * @param {PlayerAnswer} playerAnswer - The player answer
     * @param {number} oldElo - The player elo before the answer
     * @param {string} playerName - The player username
     * @param {VehicleData[]} allTanks - All the tanks available for the question
     * @param {TriviaSelected} datum - The tank selected for the question
     */
    private async handleWrongAnswer(
        winStreak: WinStreak,
        playerAnswer: PlayerAnswer,
        oldElo: number,
        playerName: string,
        allTanks: VehicleData[],
        datum: TriviaSelected
    ): Promise<void> {
        this.logger.debug(`Player {} failed to find the right answer`, playerName);

        if (!playerAnswer) {
            return;
        }

        const value = this.datum.get(playerName);

        if (!value) {
            return;
        }

        winStreak.current = 0;
        const tank = allTanks.find((tank: VehicleData): boolean => tank.name === playerAnswer?.response);

        if (!tank) {
            return;
        }

        const ammo = tank.default_profile.ammo[datum.ammoIndex];
        await playerAnswer?.interaction.editReply({
            content: '',
            embeds: [
                new EmbedBuilder()
                    .setTitle(':muscle: Mauvaise réponse :muscle:')
                    .setDescription("Tu n'a malheureusement pas trouvée la bonne réponse")
                    .setColor(Colors.Red)
                    .setFooter({ text: 'Trivia Game' })
                    .setImage(tank.images.big_icon)
                    .setFields(
                        {
                            name: 'Char sélectionné',
                            value: `\`${tank.name}\``,
                            inline: true,
                        },
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
                        {
                            name: 'Elo',
                            value: `Ton nouvelle elo est : \`${value.stats.elo}\` (modification de \`${value.stats.elo - oldElo}\`)`,
                        }
                    ),
            ],
        });
    }
}
