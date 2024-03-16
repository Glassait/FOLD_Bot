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
} from 'discord.js';
import { EmojiEnum } from '../../../shared/enums/emoji.enum';
import { ShellEnum, ShellType } from '../../loops/enums/shell.enum';
import { LoggerInjector, TriviaInjector } from '../../../shared/decorators/injector.decorator';
import { TriviaSingleton } from '../../../shared/singleton/trivia.singleton';
import { TimeEnum } from '../../../shared/enums/time.enum';
import { Ammo, VehicleData } from '../../loops/types/wot-api.type';
import { Logger } from '../../../shared/classes/logger';
import { TimeUtil } from '../../../shared/utils/time.util';
import { PlayerAnswer } from '../../loops/types/trivia-game.type';
import { MonthlyTriviaPlayerStatisticType } from '../../../shared/types/statistic.type';

@TriviaInjector
@LoggerInjector
export class TriviaModel {
    //region PRIVATE READONLY
    private readonly MAX_TIME: number = TimeEnum.MINUTE * 2;
    private readonly embedRule: EmbedBuilder = new EmbedBuilder()
        .setColor(Colors.Orange)
        .setDescription('Voici les règles concernant le jeu trivia')
        .setThumbnail(
            'https://img.poki.com/cdn-cgi/image/quality=78,width=600,height=600,fit=cover,f=auto/8fe1b52b0dce26510d0ebf4cbb484aaf.png'
        )
        .setFields(
            {
                name: 'But',
                value: 'Ce jeu vise à vous aider à mémoriser les dégâts moyens des chars de rang 10 dans World of Tanks.',
            },
            {
                name: 'Commande',
                value: "Le jeu `trivia` peut-être lancé avec la commande /trivia game dans n'importe quel salon. Il ne peut pas être lancé plus de 4 fois par jour. Lorsque vous démarrez un trivia, le bot vous envoie un message visible uniquement par vous contenant les informations suivantes :",
            },
            {
                name: 'Obus',
                value: `Affichant son type et son dégât moyen, l'obus peut être un obus standard ou un obus spécial (ou gold). ${EmojiEnum.WARNING} Le bot ne récupère actuellement que le premier canon des chars, alors soyez attentifs aux chars tels que l'IS-4, l'AMX M4 54, et autres !`,
            },
            {
                name: 'Minuteur',
                value: 'Le temps restant pour répondre au jeu. À la fin du minuteur, le bot vous enverra vos résultats : bonne ou mauvaise réponse ainsi que le char à trouver.',
            },
            {
                name: 'Bouton',
                value: `Le message sera suivi de quatre boutons cliquables. Chaque bouton représente un char rang 10 sélectionné aléatoirement. Pour répondre, il vous suffit de cliquer sur l'un des boutons. Vous pouvez changer votre réponse tant que le minuteur n'est pas terminé. ${EmojiEnum.WARNING} ️Quand 2 ou plusieurs chars ont le même obus, tous ces chars sont considérés comme de bonnes réponses.`,
            },
            {
                name: 'Sommaire',
                value: 'Tous les jours, au lancement du bot, un sommaire sera envoyé. Ce sommaire contient le top 5 des joueurs pour chaque question en termes de vitesse de réponse, ainsi que la bonne réponse et des informations sur les autres chars.',
            },
            {
                name: 'AFK',
                value: "En cas d'absence de jeu pendant une journée, une perte de 1.8% de vos points sera appliquée.",
            }
        );
    private readonly embedExample: EmbedBuilder = new EmbedBuilder()
        .setTitle('Trivia Game')
        .setColor(Colors.Aqua)
        .setFields({
            name: `Obus :`,
            value: `\`${ShellEnum.ARMOR_PIERCING} 390\``,
        });
    private readonly rowExample: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(new ButtonBuilder().setCustomId('Object 140').setLabel('Object 140').setStyle(ButtonStyle.Primary))
        .addComponents(new ButtonBuilder().setCustomId('Manticore').setLabel('Manticore').setStyle(ButtonStyle.Primary))
        .addComponents(new ButtonBuilder().setCustomId('Object 268').setLabel('Object 268').setStyle(ButtonStyle.Primary))
        .addComponents(new ButtonBuilder().setCustomId('Object 907').setLabel('Object 907').setStyle(ButtonStyle.Primary));
    private readonly responseTimeLimit = TimeEnum.SECONDE * 15;
    //endregion

    //region INJECTION
    private readonly trivia: TriviaSingleton;
    private readonly logger: Logger;
    //endregion

    public async sendRule(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.editReply({ embeds: [this.embedRule, this.embedExample], components: [this.rowExample] });
    }

    public async sendGame(interaction: ChatInputCommandInteraction): Promise<void> {
        // TODO check if all games of days done

        // TODO get the index of the last game
        const allTanks = this.trivia.allTanks[1];
        const datum = this.trivia.datum[1];

        const target = new Date();
        target.setMinutes(target.getMinutes() + this.MAX_TIME / TimeEnum.MINUTE);
        const ammo: Ammo = datum.tank.default_profile.ammo[datum.ammoIndex];

        const startGameEmbed: EmbedBuilder = new EmbedBuilder()
            .setTitle('Trivia Game')
            .setColor(Colors.Aqua)
            .setFields(
                {
                    name: 'Obus :',
                    value: `\`${ShellEnum[ammo.type as keyof typeof ShellEnum]} ${ammo.damage[1]}\``,
                    inline: true,
                },
                {
                    name: 'Minuteur',
                    value: `🕒 ${this.MAX_TIME / TimeEnum.MINUTE} minutes (fini dans <t:${TimeUtil.convertToUnix(target)}:R>).`,
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
     * Collects the answers from the players.
     */
    private async collectAnswer(gameMessage: Message<BooleanCache<CacheType>>, userName: string): Promise<void> {
        this.logger.debug('Start collecting answer of {}', userName);
        const timer = Date.now();
        let playerAnswer: PlayerAnswer;

        gameMessage
            .createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: this.MAX_TIME,
            })
            .on('collect', async (interaction: ButtonInteraction<'cached'>): Promise<void> => {
                try {
                    let hasAlreadyAnswer: boolean = false;
                    let changedAnswer: boolean = false;

                    if (playerAnswer.response) {
                        hasAlreadyAnswer = true;
                        await interaction.deferUpdate();
                    } else {
                        await interaction.deferReply({ ephemeral: true });
                    }

                    if (!hasAlreadyAnswer) {
                        playerAnswer = {
                            responseTime: Date.now() - timer,
                            response: interaction.customId,
                            interaction: interaction,
                        };

                        await interaction.editReply({
                            content: `Ta nouvelle réponse \`${playerAnswer.response}\` à bien été pris en compte !`,
                        });

                        this.logCollect(hasAlreadyAnswer, changedAnswer, interaction);
                        return;
                    }

                    if (playerAnswer.response === interaction.customId) {
                        await playerAnswer.interaction?.editReply({
                            content: `Ta précédente réponse semble être la même celle que tu viens de sélectionner !`,
                        });
                        this.logCollect(hasAlreadyAnswer, changedAnswer, interaction);
                        return;
                    }

                    changedAnswer = true;
                    playerAnswer = {
                        responseTime: Date.now() - timer,
                        response: interaction.customId,
                        interaction: playerAnswer.interaction,
                    };

                    await playerAnswer.interaction?.editReply({
                        content: `Ta réponse \`${interaction.customId}\` à bien été pris en compte !`,
                    });
                    this.logCollect(hasAlreadyAnswer, changedAnswer, interaction);
                } catch (error) {
                    this.logger.error(`Error during collecting player answer : ${error}`, error);
                }
            })
            .on('end', async (): Promise<void> => {
                this.logger.debug('Collect answer of {} end. Start calculating the scores', userName);
                await this.sendAnswerToPlayer(playerAnswer, gameMessage, userName);
            });
    }

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

    private async sendAnswerToPlayer(
        playerAnswer: PlayerAnswer,
        gameMessage: Message<BooleanCache<CacheType>>,
        userName: string
    ): Promise<void> {
        // TODO get the index of the last game
        const allTanks: VehicleData[] = this.trivia.allTanks[1];
        const datum: { ammoIndex: number; tank: VehicleData } = this.trivia.datum[1];

        const answerEmbed: EmbedBuilder = new EmbedBuilder().setTitle('Trivia Game : RÉSULTAT').setColor(Colors.Green);
        answerEmbed.setImage(datum.tank.images.big_icon).setDescription(`Le char à deviner était : \`${datum.tank.name}\``);

        const otherAnswer: string[] = ['Les autres bonnes réponses sont :'];

        const ammo: Ammo = datum.tank.default_profile.ammo[datum.ammoIndex];

        allTanks.forEach((vehicle: VehicleData): void => {
            const vehicleAmmo: Ammo = vehicle.default_profile.ammo[datum.ammoIndex];
            if (vehicle.name !== datum.tank.name && vehicleAmmo.type === ammo.type && this.checkVehicleAmmoDetail(vehicleAmmo, ammo)) {
                this.logger.debug(`Another tank has the same shell {}`, vehicle.name);
                otherAnswer.push(vehicle.name);
            }
        });

        if (otherAnswer.length > 1) {
            answerEmbed.setFields({ name: 'Autre bonne réponses :', value: otherAnswer.join('\n') });
        }

        await gameMessage.edit({ embeds: [answerEmbed], components: [] });
        this.logger.debug('Game message update with answer and top 3 players');

        await this.updateStatistic(playerAnswer, this.isGoodAnswer(playerAnswer, datum, allTanks), userName, allTanks, datum);
    }

    private checkVehicleAmmoDetail(vehicleAmmo: Ammo, ammo: Ammo): boolean {
        return vehicleAmmo.damage[1] === ammo.damage[1];
    }

    private isGoodAnswer(
        playerAnswer: PlayerAnswer,
        datum: {
            ammoIndex: number;
            tank: VehicleData;
        },
        allTanks: VehicleData[]
    ): boolean {
        return playerAnswer.response === datum.tank.name || this.isAnotherTanks(playerAnswer, datum, allTanks);
    }

    private isAnotherTanks(
        playerResponse: PlayerAnswer,
        datum: {
            ammoIndex: number;
            tank: VehicleData;
        },
        allTanks: VehicleData[]
    ): boolean {
        const vehicle: VehicleData | undefined = allTanks.find((vehicle: VehicleData): boolean => vehicle.name === playerResponse.response);

        if (!vehicle) {
            return false;
        }

        const vehicleAmmo: Ammo = vehicle.default_profile.ammo[datum.ammoIndex];
        const ammo: Ammo = datum.tank.default_profile.ammo[datum.ammoIndex];
        return vehicleAmmo.type === ammo.type && this.checkVehicleAmmoDetail(vehicleAmmo, ammo);
    }

    private async updateStatistic(
        playerAnswer: PlayerAnswer,
        isGoodAnswer: boolean,
        username: string,
        allTanks: VehicleData[],
        datum: { ammoIndex: number; tank: VehicleData }
    ): Promise<void> {
        this.logger.debug(`Start updating {} statistic`, username);
        await this.updatePlayerStatistic(username, playerAnswer, isGoodAnswer, allTanks, datum);
        this.logger.debug(`End updating {} statistic`, username);
    }

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

    private async updatePlayerStatistic(
        playerName: string,
        playerAnswer: PlayerAnswer,
        isGoodAnswer: boolean,
        allTanks: VehicleData[],
        datum: { ammoIndex: number; tank: VehicleData }
    ): Promise<void> {
        // const player: TriviaPlayerStatisticType = this.triviaStats.player[playerName] ?? {};

        // const playerStat: MonthlyTriviaPlayerStatisticType = player[this.statistic.currentMonth] ?? {
        //     elo: 0,
        //     right_answer: 0,
        //     win_strick: { current: 0, max: 0 },
        //     answer_time: [],
        //     participation: 0,
        // };
        // playerStat.participation++;
        // playerStat.answer_time.push(playerAnswer.responseTime);

        // const oldElo = playerStat.elo;
        // playerStat.elo = this.calculateElo(playerStat, playerAnswer, isGoodAnswer ? goodAnswer.indexOf(isGoodAnswer) + 1 : -1);
        //
        // const winStrick = playerStat.win_strick as { current: number; max: number };

        if (isGoodAnswer) {
            await this.handleGoodAnswer(/*playerStat, winStrick,*/ playerAnswer, /* oldElo,*/ playerName);
        } else {
            await this.handleWrongAnswer(/*playerStat, winStrick,*/ playerAnswer, /*oldElo,*/ playerName, allTanks, datum);
        }

        // player[this.statistic.currentMonth] = playerStat;
        // this.triviaStats.player[playerName] = player;
    }

    private async handleGoodAnswer(
        // playerStat: MonthlyTriviaPlayerStatisticType,
        // winStrick: {
        //     current: number;
        //     max: number;
        // },
        playerAnswer: PlayerAnswer,
        // oldElo: number,
        playerName: string
    ): Promise<void> {
        // playerStat.right_answer++;
        // winStrick.current++;
        // winStrick.max = Math.max(winStrick.current, winStrick.max);

        await playerAnswer.interaction.editReply({
            content: `Tu as eu la bonne réponse, bravo :clap:.\nTon nouvelle elo est : \`${'' /*playerStat.elo*/}\` (modification de \`${
                ''
                // playerStat.elo - oldElo
            }\`)`,
        });
        this.logger.debug(`Player {} found the right answer`, playerName);
    }

    private async handleWrongAnswer(
        // playerStat: MonthlyTriviaPlayerStatisticType,
        // winStrick: {
        //     current: number;
        //     max: number;
        // },
        playerAnswer: PlayerAnswer,
        // oldElo: number,
        playerName: string,
        allTanks: VehicleData[],
        datum: { ammoIndex: number; tank: VehicleData }
    ): Promise<void> {
        // winStrick.current = 0;
        const tank = allTanks.find((tank: VehicleData): boolean => tank.name === playerAnswer.response);

        if (!tank) {
            return;
        }

        const ammo = tank.default_profile.ammo[datum.ammoIndex];
        await playerAnswer.interaction.editReply({
            content: `Tu n'as pas eu la bonne réponse !\nLe char \`${tank.name}\` a un obus ${
                datum.ammoIndex ? ShellType.GOLD : ShellType.NORMAL
            } \`${ShellEnum[ammo.type as keyof typeof ShellEnum]}\` avec un alha' de \`${ammo.damage[1]}\`.\nTon nouvelle elo est : \`${
                ''
                // playerStat.elo
            }\` (modification de \`${'' /*playerStat.elo - oldElo*/}\`)`,
        });
        this.logger.debug(`Player {} failed to find the right answer`, playerName);
    }
}
