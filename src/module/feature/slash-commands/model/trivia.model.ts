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
    StringSelectMenuBuilder,
    type StringSelectMenuInteraction,
    StringSelectMenuOptionBuilder,
} from 'discord.js';
import { Injectable, LoggerInjector, TableInjectable } from '../../../shared/decorators/injector.decorator';
import { EmojiEnum } from '../../../shared/enums/emoji.enum';
import { TimeEnum } from '../../../shared/enums/time.enum';
import type { TriviaSingleton } from '../../../shared/singleton/trivia.singleton';
import type { PlayersAnswersTable } from '../../../shared/tables/players-answers.table';
import type { PlayersTable } from '../../../shared/tables/players.table';
import type { TriviaDataTable } from '../../../shared/tables/trivia-data.table';
import type { WinStreakTable } from '../../../shared/tables/win-streak.table';
import type { Tank, TriviaAnswer, TriviaData, TriviaPlayer, WinStreak } from '../../../shared/types/table.type';
import type { TriviaSelected } from '../../../shared/types/trivia.type';
import type { Ammo } from '../../../shared/types/wot-api.type';
import { DateUtil } from '../../../shared/utils/date.util';
import type { Logger } from '../../../shared/utils/logger';
import { StringUtil } from '../../../shared/utils/string.util';
import { TimeUtil } from '../../../shared/utils/time.util';
import { MEDAL } from '../../../shared/utils/variables.util';
import { ShellEnum, ShellType } from '../enums/shell.enum';
import type { PlayerAnswer } from '../types/trivia-game.type';

@LoggerInjector
export class TriviaModel {
    //region INJECTABLE
    private readonly logger: Logger;
    @Injectable('Trivia') private readonly trivia: TriviaSingleton;
    @TableInjectable('TriviaData') private readonly triviaTable: TriviaDataTable;
    @TableInjectable('Players') private readonly playersTable: PlayersTable;
    @TableInjectable('PlayersAnswer') private readonly playerAnswerTable: PlayersAnswersTable;
    @TableInjectable('WinStreak') private readonly winStreakTable: WinStreakTable;
    //endregion

    //region PRIVATE READONLY FIELDS
    /**
     * Embed containing all the information for the rule command
     */
    private readonly embedRule: EmbedBuilder = new EmbedBuilder()
        .setColor(Colors.Orange)
        .setTitle('Voici les règles concernant le jeu trivia V2.1')
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
                value: `Affichant son \`type\` (AP, APCR, etc) et son \`dégât moyen (alpha)\`, l'obus peut être un obus \`standard\` ou un obus \`spécial\` (dit gold). **${EmojiEnum.WARNING} Depuis la V2.1, le bot récupère le canon dit 'méta' des chars. Cependant, il n'utilise qu'un seul canon, donc faites attention au char comme le E-100 ou c'est le premier canon qui est sélectionné !**`,
            },
            {
                name: 'Minuteur',
                value: `Tu as \`30 secondes\` pour répondre à la question. À la fin du minuteur, le bot t'enverra ton résultat : bonne ou mauvaise réponse ainsi que les informations sur le char à trouver et sur le char que tu as sélectionné.\n\nLorsque tu répond à la question en moins de \`10 secondes\`, tu obtiens un bonus de \`25%\` sur les points obtenus en cas de bonne réponse. ${EmojiEnum.WARNING} **Le temps de réponse change si tu sélectionnes une autre réponse**`,
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
            },
            {
                name: 'Valeur',
                value: `${EmojiEnum.WARNING} Les valeurs indiquées dans les paragraphes précédent peuvent être modifiées sans avoir été mis à jour dans le texte. Une communication pourra être fais dans ce cas la !`,
            }
        );
    /**
     * Embed use as exemple for the rule command
     */
    private readonly embedExample: EmbedBuilder = new EmbedBuilder()
        .setTitle('Example de question')
        .setDescription("Dans cette exemple, les boutons sont clickable mais aucune logique n'est implémenté !")
        .setColor(Colors.Blurple)
        .setFields(
            {
                name: 'Obus :',
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
    private datum: Map<
        string,
        {
            player: TriviaPlayer;
            questionNumber: number;
            interaction: ChatInputCommandInteraction;
        }
    >;
    //endregion

    /**
     * Initialize the class
     */
    public async initialize(): Promise<void> {
        this.maxQuestionDuration = TimeEnum.MINUTE * (await this.triviaTable.getMaxDurationOfQuestion());
        this.responseTimeLimit = TimeEnum.SECONDE * (await this.triviaTable.getMaxResponseTimeLimit());
        this.maxNumberOfQuestion = await this.triviaTable.getMaxNumberOfQuestion();
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
        let player: TriviaPlayer = await this.playersTable.getPlayerByName(interaction.user.username);

        if (!player) {
            try {
                const added = await this.playersTable.addPlayer(interaction.user.username);

                if (!added) {
                    throw new Error('Return false');
                }

                this.logger.info('New player added to trivia database {}', interaction.user.username);
                player = await this.playersTable.getPlayerByName(interaction.user.username);
            } catch (reason) {
                await interaction.editReply({
                    content: 'Il y a un problème avec la base de données, merci de réessayer plus tard',
                });
                this.logger.error(`Failed to insert new player in database with error : ${reason}`);
                return;
            }
        }

        const numberOfAnswer: number = await this.playerAnswerTable.countAnswerOfPlayer(player.id);
        if (numberOfAnswer >= this.maxNumberOfQuestion) {
            await interaction.editReply({
                content: `Tu as atteint le nombre maximum de question par jour ! (actuellement ${this.maxNumberOfQuestion} par jour)\nReviens demain pour pouvoir rejouer !`,
            });
            return;
        }

        if (this.datum.get(player.name)) {
            await interaction.editReply({
                content: `Tu as déjà une parti de trivia en cours ! Merci d'attendre que la partie précédente ce termine avant de lancer une nouvelle partie`,
            });
            return;
        }

        const value = {
            player: player,
            questionNumber: numberOfAnswer,
            interaction: interaction,
        };

        this.datum.set(player.name, value);

        const { allTanks, datum } = this.getData(player.name);

        if (!allTanks || allTanks.length === 0) {
            await interaction.editReply({
                content:
                    'Le jeu ne semble pas encore initialisé, merci de réessayer dans quelque minutes. Si le problème persist merci de contacter <@313006042340524033>',
            });
            return;
        }

        const ammo: Ammo = datum.tank.ammo[datum.ammoIndex];

        const target = new Date();
        target.setTime(target.getTime() + this.maxQuestionDuration * TimeEnum.MINUTE);

        const startGameEmbed: EmbedBuilder = new EmbedBuilder()
            .setTitle('Devine le bon char')
            .setFooter({ text: 'Trivia Game' })
            .setDescription(`Tu es entrain de répondre à la question n°\`${numberOfAnswer + 1 || 1}\` sur ${this.maxNumberOfQuestion}`)
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

        await this.collectAnswer(gameMessage, interaction.user.username);
    }

    /**
     * Sends the trivia statistics for a specific month to the user.
     *
     * @param {ChatInputCommandInteraction} interaction - The interaction object representing the user command.
     */
    public async sendStatistics(interaction: ChatInputCommandInteraction): Promise<void> {
        const player: TriviaPlayer = await this.playersTable.getPlayerByName(interaction.user.username);

        if (!player) {
            await interaction.editReply({
                content: "Tu n'as pas encore joué à Trivia. Essaye après avoir répondu au moins une fois au jeu. (`/trivia game`)",
            });
            return;
        }

        const lastAnswer: TriviaAnswer = await this.playerAnswerTable.getLastAnswerOfPlayer(player.id);

        if (!lastAnswer) {
            await interaction.editReply({
                content:
                    "Tu n'as pas encore de statistiques pour le jeu Trivia. Essaye après avoir répondu au moins une fois au jeu. (`/trivia game`)",
            });
            return;
        }

        const periods: { year: number; month: number }[] = (await this.playerAnswerTable.getAllPeriodsOfPlayer(player.id)).reverse();

        const select: StringSelectMenuBuilder = new StringSelectMenuBuilder()
            .setCustomId('trivia-statistics-select')
            .setPlaceholder('Choisissez un mois');

        periods.forEach(({ month, year }) =>
            select.addOptions(new StringSelectMenuOptionBuilder().setLabel(`${month} ${year}`).setValue(`${year}-${month}`))
        );

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
        const message: Message<BooleanCache<CacheType>> = await interaction.editReply({
            components: [row],
            content: 'Choisissez un mois pour voir les statistiques.',
        });

        message
            .createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: TimeEnum.HOUR })
            .on('collect', async (i: StringSelectMenuInteraction): Promise<void> => {
                let [year, month]: any = i.values[0].split('-');
                year = Number(year);
                month = Number(month);

                const date = new Date();
                date.setMonth(month);
                date.setFullYear(year);

                const stats: TriviaAnswer[] = await this.playerAnswerTable.getPeriodAnswerOfPlayer(player.id, month, year);
                const winstreak: WinStreak = await this.winStreakTable.getWinStreakFromDate(player.id, date);

                const embed = new EmbedBuilder()
                    .setTitle(`Statistiques pour le mois de ${month} ${year}`)
                    .setColor(Colors.LuminousVividPink)
                    .setDescription('Voici les statistiques demandées')
                    .setFields(
                        { name: 'Elo', value: `\`${stats[stats.length - 1].elo}\``, inline: true },
                        {
                            name: 'Nombre de bonnes réponses',
                            value: `\`${stats.reduce((number: number, { right_answer }) => {
                                return number + (right_answer ? 1 : 0);
                            }, 0)}\``,
                            inline: true,
                        },
                        { name: 'Plus longue séquence correcte', value: `\`${winstreak.max}\`` },
                        {
                            name: 'Réponse la plus rapide',
                            value: `\`${Math.min(...stats.flatMap(({ answer_time }) => Number(answer_time))) / TimeEnum.SECONDE}\` sec`,
                            inline: true,
                        },
                        {
                            name: 'Réponse la plus longue',
                            value: `\`${Math.max(...stats.flatMap(({ answer_time }) => Number(answer_time))) / TimeEnum.SECONDE}\` sec`,
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
            .setDescription(`Voici le scoreboard du mois de \`${DateUtil.getCurrentMonth()}\` pour le jeu trivia`)
            .setFooter({ text: 'Trivia game' })
            .setColor(Colors.Fuchsia);

        const players: TriviaPlayer[] = await this.playersTable.getAllPlayers();

        if (players.length === 0) {
            await interaction.editReply({
                content: "Aucun joueur n'a pour l'instant joué au jeu",
            });
            return;
        }

        const promises: Promise<TriviaAnswer & TriviaPlayer>[] = players.map(({ id }) =>
            this.playerAnswerTable.getLastAnswerWithPlayerOfPlayer(id)
        );
        const playerStats = (await Promise.all(promises))
            .filter(({ date }): boolean => date.getMonth() === new Date().getMonth())
            .sort((a: TriviaAnswer & TriviaPlayer, b: TriviaAnswer & TriviaPlayer) => b.elo - a.elo);

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
    private getData(username: string): { allTanks: Tank[]; datum: TriviaSelected } {
        const value = this.datum.get(username);

        return {
            allTanks: this.trivia.allTanks[value?.questionNumber ?? 0],
            datum: this.trivia.datum[value?.questionNumber ?? 0],
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
                    const hasAlreadyAnswer: boolean = !!playerAnswer?.interaction;
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
                                ? `Ta réponse a été mise à jour en \`${interaction.customId.split('#')[0]}\``
                                : `Ta réponse \`${interaction.customId.split('#')[0]}\` a été enregistrée !`,
                        });

                        changedAnswer = true;
                    } else {
                        await playerAnswer.interaction?.editReply({
                            content: 'Ta réponse semble être la même que celle que tu as sélectionnée précédemment.',
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

        const ammo: Ammo = datum.tank.ammo[datum.ammoIndex];

        allTanks.forEach((vehicle: Tank): void => {
            const vehicleAmmo: Ammo = vehicle.ammo[datum.ammoIndex];
            if (vehicle.name !== datum.tank.name && this.checkVehicleAmmoDetail(vehicleAmmo, ammo)) {
                this.logger.debug('Another tank has the same shell {}', vehicle.name);
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
     * @param {PlayerAnswer} playerAnswer - The player answer
     * @param {string} username - The player username
     *
     * @return {boolean} - True if the player answer is the good answer, false otherwise
     */
    private isGoodAnswer(playerAnswer: PlayerAnswer, username: string): boolean {
        const { datum } = this.getData(username);
        const tankId = Number(playerAnswer?.response.split('#')[1]);
        return tankId === datum.tank.id || this.isAnotherTanks(tankId, username);
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
        const { allTanks, datum } = this.getData(username);
        const vehicle: Tank | undefined = allTanks.find((vehicle: Tank): boolean => vehicle.id === tankId);

        if (!vehicle) {
            return false;
        }

        return this.checkVehicleAmmoDetail(vehicle.ammo[datum.ammoIndex], datum.tank.ammo[datum.ammoIndex]);
    }

    /**
     * Updates the statistic after a player has completed a trivia game.
     *
     * @param {PlayerAnswer} playerAnswer - The player's final answer.
     * @param {boolean} isGoodAnswer - Indicates whether the player's final answer is correct or not.
     * @param {string} username - The username of the player.
     */
    private async updateStatistic(playerAnswer: PlayerAnswer, isGoodAnswer: boolean, username: string): Promise<void> {
        this.logger.debug('Start updating {} statistic', username);
        await this.updatePlayerStatistic(username, playerAnswer, isGoodAnswer);
        this.datum.delete(username);
        this.logger.debug('End updating {} statistic', username);
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

        const lastAnswer: TriviaAnswer = await this.playerAnswerTable.getLastAnswerOfPlayer(value.player.id);

        const oldElo = lastAnswer.elo;
        const elo = this.calculateElo(oldElo, playerAnswer?.responseTime, isGoodAnswer);

        try {
            const added: boolean = await this.playerAnswerTable.addAnswer(
                value.player.id,
                datum.id,
                new Date(),
                isGoodAnswer,
                playerAnswer.responseTime,
                elo
            );

            if (!added) {
                await playerAnswer.interaction.editReply({
                    content: "Une erreur est survenue lors de l'enregistrement de ta réponse dans la base de données !",
                });
                this.logger.error(StringUtil.transformToCode(`Failed to add answer of player {} in database`, playerName));
                return;
            }

            this.logger.info('Successfully add player {} answer in database', playerName);
        } catch (reason) {
            await playerAnswer.interaction.editReply({
                content: "Une erreur est survenue lors de l'enregistrement de ta réponse dans la base de données !",
            });
            this.logger.error(
                StringUtil.transformToCode(`Failed to add answer of player {} in database, with error {}`, playerName, reason)
            );
            return;
        }

        let winStreak: WinStreak = await this.winStreakTable.getWinStreakFromDate(value.player.id, new Date());

        if (!winStreak) {
            try {
                const added = await this.winStreakTable.addWinStreak(value.player.id);

                if (!added) {
                    await playerAnswer.interaction.editReply({
                        content: 'Une erreur est survenue lors de la création de tes statistiques dans la base de données !',
                    });
                    this.logger.error(StringUtil.transformToCode(`Failed to create winstreak for player {} in database`, playerName));
                    return;
                }

                this.logger.info('Successfully create winstreak for player {} in database', playerName);
                winStreak = { max: 0, current: 0 };
            } catch (reason) {
                await playerAnswer.interaction.editReply({
                    content: 'Une erreur est survenue lors de la création de tes statistiques dans la base de données !',
                });
                this.logger.error(
                    StringUtil.transformToCode(`Failed to create winstreak for player {} in database, with error {}`, playerName, reason)
                );
                return;
            }
        }

        if (isGoodAnswer) {
            await this.handleGoodAnswer(winStreak, playerAnswer, oldElo, elo, playerName);
        } else {
            await this.handleWrongAnswer(winStreak, playerAnswer, oldElo, elo, playerName, allTanks, datum);
        }
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
     * @param {number} newElo - The player elo after the answer
     * @param {string} playerName - The player username
     */
    private async handleGoodAnswer(
        winStreak: WinStreak,
        playerAnswer: PlayerAnswer,
        oldElo: number,
        newElo: number,
        playerName: string
    ): Promise<void> {
        const value = this.datum.get(playerName);

        if (!value) {
            return;
        }

        winStreak.current++;
        winStreak.max = Math.max(winStreak.current, winStreak.max);

        await this.updateWinstreak(playerName, winStreak, playerAnswer);

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
                        value: `Ton nouvelle elo est : \`${newElo}\` (modification de \`${newElo - oldElo}\`)`,
                    }),
            ],
        });
        this.logger.debug('Player {} found the right answer', playerName);
    }

    /**
     * handle the logic when the player haven't answered or found the answer
     *
     * @param {{ current: number; max: number }} winStreak - The player win streak
     * @param {PlayerAnswer} playerAnswer - The player answer
     * @param {number} oldElo - The player elo before the answer
     * @param {number} newElo - The player elo after the answer
     * @param {string} playerName - The player username
     * @param {Tank[]} allTanks - All the tanks available for the question
     * @param {TriviaSelected} datum - The tank selected for the question
     */
    private async handleWrongAnswer(
        winStreak: WinStreak,
        playerAnswer: PlayerAnswer,
        oldElo: number,
        newElo: number,
        playerName: string,
        allTanks: Tank[],
        datum: TriviaSelected
    ): Promise<void> {
        this.logger.debug('Player {} failed to find the right answer', playerName);

        if (!playerAnswer) {
            return;
        }

        const value = this.datum.get(playerName);

        if (!value) {
            return;
        }

        winStreak.current = 0;
        await this.updateWinstreak(playerName, winStreak, playerAnswer);

        const tank = allTanks.find((tank: Tank): boolean => tank.name === playerAnswer?.response);

        if (!tank) {
            return;
        }

        const ammo = tank.ammo[datum.ammoIndex];
        await playerAnswer?.interaction.editReply({
            content: '',
            embeds: [
                new EmbedBuilder()
                    .setTitle(':muscle: Mauvaise réponse :muscle:')
                    .setDescription("Tu n'a malheureusement pas trouvée la bonne réponse")
                    .setColor(Colors.Red)
                    .setFooter({ text: 'Trivia Game' })
                    .setImage(tank.image)
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
                            value: `Ton nouvelle elo est : \`${newElo}\` (modification de \`${newElo - oldElo}\`)`,
                        }
                    ),
            ],
        });
    }

    /**
     * Updates the winstreak for a player in the database.
     *
     * @param {string} playerName - The name of the player.
     * @param {WinStreak} winStreak - The player's current winstreak data.
     * @param {PlayerAnswer} playerAnswer - The interaction object of the player's answer.
     */
    private async updateWinstreak(playerName: string, winStreak: WinStreak, playerAnswer: PlayerAnswer): Promise<void> {
        const value = this.datum.get(playerName);

        if (!value) {
            return;
        }

        try {
            const update = await this.winStreakTable.updateWinStreak(value.player.id, new Date(), winStreak);

            if (!update) {
                await playerAnswer.interaction.editReply({
                    content: 'Une erreur est survenue lors de la mise à jour de tes statistiques dans la base de données !',
                });
                this.logger.error(StringUtil.transformToCode(`Failed to update winstreak for player {} in database`, playerName));
                return;
            }

            this.logger.info('Successfully update winstreak for player {} in database', playerName);
        } catch (reason) {
            await playerAnswer.interaction.editReply({
                content: 'Une erreur est survenue lors de la mise à jour de tes statistiques dans la base de données !',
            });
            this.logger.error(
                StringUtil.transformToCode(`Failed to update winstreak for player {} in database, with error {}`, playerName, reason)
            );
            return;
        }
    }
}
