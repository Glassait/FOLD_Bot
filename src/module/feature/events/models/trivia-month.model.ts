import { type Client, Colors, EmbedBuilder, type TextChannel } from 'discord.js';
import type { Logger } from '../../../shared/classes/logger';
import { Injectable, LoggerInjector } from '../../../shared/decorators/injector.decorator';
import { EmojiEnum } from '../../../shared/enums/emoji.enum';
import { TimeEnum } from '../../../shared/enums/time.enum';
import type { InventorySingleton } from '../../../shared/singleton/inventory.singleton';
import type { StatisticSingleton } from '../../../shared/singleton/statistic.singleton';
import type {
    MonthlyTriviaOverallStatistic,
    MonthlyTriviaPlayerStatistic,
    TriviaPlayerStatistic,
} from '../../../shared/types/statistic.type';
import { DateUtil } from '../../../shared/utils/date.util';
import { MathUtil } from '../../../shared/utils/math.util';
import { StringUtil } from '../../../shared/utils/string.util';
import { MEDAL } from '../../../shared/utils/variables.util';

@LoggerInjector
export class TriviaMonthModel {
    //region INJECTABLE
    private readonly logger: Logger;
    @Injectable('Inventory') private readonly inventory: InventorySingleton;
    @Injectable('Statistic') private readonly statistic: StatisticSingleton;
    //endregion

    //region PRIVATE
    /**
     * The trivia text channel, used to send the month message into
     */
    private channel: TextChannel;
    /**
     * The previous month
     */
    private month: string = DateUtil.getPreviousMonth();
    /**
     * Represents the list of player statistics.
     * Each entry is a tuple containing the player's name and their monthly statistics.
     *
     * The first element of the tuple is the player's name (string).
     *
     * The second element of the tuple is the player's monthly statistics (MonthlyTriviaPlayerStatisticType).
     */
    private playerClassement: [string, MonthlyTriviaPlayerStatistic][];
    /**
     * The list of embed for the message
     */
    private listEmbed: EmbedBuilder[] = [];
    //endregion

    /**
     * Performs mandatory tasks at the beginning of each month for the trivia game.
     * This includes creating the trivia month message, fetching the trivia channel, and initializing necessary data.
     *
     * @param {Client} client - The Discord client instance.
     */
    public async initialise(client: Client): Promise<void> {
        this.logger.info('First of the month, creation of the trivia month message');
        this.channel = await this.inventory.getChannelForTrivia(client);

        this.playerClassement = Object.entries(this.statistic.trivia.player)
            .reduce((newArray: [string, MonthlyTriviaPlayerStatistic][], [name, statistics]: [string, TriviaPlayerStatistic]) => {
                if (statistics[this.month]) {
                    newArray.push([name, statistics[this.month]]);
                }

                return newArray;
            }, [])
            .sort(
                ([, aStatistics]: [string, MonthlyTriviaPlayerStatistic], [, bStatistics]: [string, MonthlyTriviaPlayerStatistic]) =>
                    bStatistics.elo - aStatistics.elo
            );
    }

    /**
     * Sends the trivia month message to the designated channel.
     */
    public async createEmbedAndSendToChannel(): Promise<void> {
        this.createEmbed();

        this.logger.debug(`${EmojiEnum.LETTER} Sending trivia month message`);
        await this.channel.send({ embeds: this.listEmbed });
    }

    /**
     * Creates multiple embeds for various statistics and information related to the trivia game.
     */
    private createEmbed(): void {
        this.logger.debug(`${EmojiEnum.HAMMER} Start building embed for trivia month`);
        this.embedIntroduction();
        this.embedScoreboard();

        if (this.playerClassement.length > 0) {
            this.logger.debug('Enough players to build embed for trivia month');
            this.embedQuickPlayer();
            this.embedSlowPlayer();
            this.embedWinStreakPlayer();
        }

        this.embedOverall();
    }

    /**
     * Create the introduction embed
     */
    private embedIntroduction(): void {
        this.listEmbed.push(
            new EmbedBuilder()
                .setTitle(`Résumé du mois de ${this.month}`)
                .setDescription('Le dernier mois a été chargé en apprentissage. Découvrons les statistiques du mois.')
                .setImage('https://us-wotp.wgcdn.co/dcont/fb/image/wall_february_2018_1024x600.jpg')
                .setColor(Colors.DarkGold)
        );
    }

    /**
     * Create the scoreboard embed
     */
    private embedScoreboard(): void {
        let index: number = 0;
        let embed: EmbedBuilder = new EmbedBuilder()
            .setTitle('Tableau des scores')
            .setDescription(
                'Nous allons visualiser dans un premier temps le score des joueurs. \n(Plus de détails avec la commande `/trivia statistics`)'
            )
            .setColor(Colors.DarkGold)
            .setFields({
                name: 'Scoreboard',
                value: "Il semblerait qu'un joueur n'ai participé au trivia game durant ce mois (っ °Д °;)っ",
            })
            .setImage(
                'https://media.istockphoto.com/id/1124667817/photo/desperate-upset-teen-girl-victim-crying-alone-at-home.jpg?s=612x612&w=0&k=20&c=GBExtQT11X25SZxVrqCNs8RURDVz-yVELpJqoFogy9w='
            );

        if (this.playerClassement?.length > 0) {
            embed = new EmbedBuilder()
                .setTitle('Tableau des scores')
                .setDescription(
                    'Nous allons visualiser dans un premier temps le score des joueurs. \n(Plus de détails avec la commande `/trivia statistics)`'
                )
                .setColor(Colors.DarkGold)
                .setFields({
                    name: 'Leaderboard',
                    value:
                        'Les trois meilleurs joueurs du mois sont : \n\n' +
                        this.playerClassement
                            .slice(0, 3)
                            .reduce(
                                (text: string, [name, statistics]: [string, MonthlyTriviaPlayerStatistic]) =>
                                    text + StringUtil.transformToCode(`${MEDAL[index++]} ${name} avec {} points\n`, statistics.elo),
                                ''
                            ),
                });

            if (this.playerClassement.length > 3) {
                embed.addFields({
                    name: 'Scoreboard',
                    value:
                        'Voila le reste du classement :\n\n' +
                        this.playerClassement
                            .slice(3, -1)
                            .reduce(
                                (text: string, [name, statistics]: [string, MonthlyTriviaPlayerStatistic]) =>
                                    text + StringUtil.transformToCode(`${1 + ++index} : ${name} avec {} points\n`, statistics.elo),
                                ''
                            ),
                });
            }
        }
        this.listEmbed.push(embed);
    }

    /**
     * Create embed for the quickest player
     */
    private embedQuickPlayer(): void {
        this.playerClassement.sort(
            ([, aStatistics]: [string, MonthlyTriviaPlayerStatistic], [, bStatistics]: [string, MonthlyTriviaPlayerStatistic]) =>
                MathUtil.getMinFromArrayOfObject(Object.values(aStatistics.daily), 'answer_time') -
                MathUtil.getMinFromArrayOfObject(Object.values(bStatistics.daily), 'answer_time')
        );

        const [name, statistics]: [string, MonthlyTriviaPlayerStatistic] = this.playerClassement[0];

        this.listEmbed.push(
            new EmbedBuilder()
                .setTitle('Le joueur le plus rapide')
                .setDescription(
                    StringUtil.transformToCode(
                        `Tel un EBR 75, {} détruit ces ennemies plus vite que l'éclair. Ainsi il a répondu le plus rapidement en {} secondes.`,
                        name,
                        MathUtil.getMinFromArrayOfObject(Object.values(statistics.daily), 'answer_time') / TimeEnum.SECONDE
                    )
                )
                .setColor(Colors.DarkGold)
                .setImage('https://images6.alphacoders.com/131/1315267.jpeg')
        );
    }

    /**
     * Create embed for the slowest player
     */
    private embedSlowPlayer(): void {
        this.playerClassement.sort(
            ([, aStatistics]: [string, MonthlyTriviaPlayerStatistic], [, bStatistics]: [string, MonthlyTriviaPlayerStatistic]) =>
                MathUtil.getMaxFromArrayOfObject(Object.values(bStatistics.daily), 'answer_time') -
                MathUtil.getMaxFromArrayOfObject(Object.values(aStatistics.daily), 'answer_time')
        );
        const [name, statistics] = this.playerClassement[0];

        this.listEmbed.push(
            new EmbedBuilder()
                .setTitle('Le joueur le plus lent')
                .setDescription(
                    StringUtil.transformToCode(
                        `{} est un véritable mur d'acier IRL, du coup il prend son temps pour répondre. Son temps le plus long est de {} secondes.`,
                        name,
                        MathUtil.getMaxFromArrayOfObject(Object.values(statistics.daily), 'answer_time') / TimeEnum.SECONDE
                    )
                )
                .setColor(Colors.DarkGold)
                .setImage('https://static-ptl-eu.gcdn.co/dcont/fb/image/wot_wallpaperseptember2015_eng_1024x600_eng.jpg')
        );
    }

    /**
     * Create embed for the best win streak
     */
    private embedWinStreakPlayer(): void {
        this.playerClassement.sort(
            ([, aStatistics]: [string, MonthlyTriviaPlayerStatistic], [, bStatistics]: [string, MonthlyTriviaPlayerStatistic]) =>
                bStatistics.win_streak.max - aStatistics.win_streak.max
        );
        const [name, statistics]: [string, MonthlyTriviaPlayerStatistic] = this.playerClassement[0];

        this.listEmbed.push(
            new EmbedBuilder()
                .setTitle("Le joueur avec le plus de bonnes réponses d'affilée")
                .setDescription(
                    StringUtil.transformToCode(
                        `{} est tel un Léopard, il rate jamais ça cible. {} a correctement répondu {} fois d'affilée.`,
                        name,
                        name,
                        statistics.win_streak.max
                    )
                )
                .setColor(Colors.DarkGold)
                .setImage(
                    'https://worldoftanks.eu/dcont/fb/media/july_2013_wallpaper/normal/july2013_1920x1080_cl.jpg?MEDIA_PREFIX=/dcont/fb/'
                )
        );
    }

    /**
     * Create the embed for overall statistics
     */
    private embedOverall(): void {
        const overallStatistic: MonthlyTriviaOverallStatistic = this.statistic.trivia.overall[this.month];

        if (!overallStatistic) {
            return;
        }

        this.listEmbed.push(
            new EmbedBuilder()
                .setTitle('Statistique générale')
                .setDescription('Pour finir voici des statistiques inutiles.')
                .setColor(Colors.DarkGold)
                .setFields(
                    { name: 'Nombre total de parties :', value: `\`${overallStatistic.number_of_game}\`` },
                    {
                        name: 'Nombre de jours sans participation :',
                        value: `\`${overallStatistic.day_without_participation}\``,
                    }
                )
        );
    }
}
