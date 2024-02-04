import { InventoryInjector, LoggerInjector, StatisticInjector } from '../../../shared/decorators/injector.decorator';
import { InventorySingleton } from '../../../shared/singleton/inventory.singleton';
import { Client, Colors, EmbedBuilder, TextChannel } from 'discord.js';
import { StatisticSingleton } from '../../../shared/singleton/statistic.singleton';
import { MonthlyTriviaOverallStatisticType, TriviaPlayerStatisticType, TriviaStatisticType } from '../../../shared/types/statistic.type';
import { MEDAL } from '../../../shared/utils/variables.util';
import { TimeEnum } from '../../../shared/enums/time.enum';
import { Logger } from '../../../shared/classes/logger';

@InventoryInjector
@StatisticInjector
@LoggerInjector
export class TriviaMonthModel {
    //region INJECTION
    private readonly inventory: InventorySingleton;
    private readonly statistic: StatisticSingleton;
    private readonly logger: Logger;
    //endregion

    //region PRIVATE
    /**
     * The trivia text channel
     * @private
     */
    private channel: TextChannel;
    /**
     * The previous month
     * @private
     */
    private month: string;
    /**
     * The list of all player's statistics
     * @private
     */
    private playerClassement: [string, TriviaPlayerStatisticType][];
    /**
     * The list of embed for the message
     * @private
     */
    private listEmbed: EmbedBuilder[];
    //endregion

    /**
     * Fetch and initialize mandatory thing
     * @param client the discord client
     * @param today today date
     */
    public async fetchMandatory(client: Client, today: Date): Promise<void> {
        this.logger.info('First of the month, creation of the trivia month message');
        this.channel = await this.inventory.getChannelForTrivia(client);

        const month = new Date();
        month.setMonth(today.getMonth() - 1);
        this.month = month.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

        const stats: TriviaStatisticType = this.statistic.trivia;

        this.playerClassement = Object.entries(stats.player).sort(
            (a: [string, TriviaPlayerStatisticType], b: [string, TriviaPlayerStatisticType]) => b[1][this.month].elo - a[1][this.month].elo
        );
        this.listEmbed = [];
    }

    /**
     * Send all the trivia month embeds to the channel
     */
    public async sendToChannel(): Promise<void> {
        this.logger.info('Sending trivia month message...');
        await this.channel.send({
            content: '@here',
            embeds: this.listEmbed,
        });
    }

    /**
     * Create the introduction embed
     */
    public embedIntroduction(): void {
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
    public embedScoreboard(): void {
        let index = 0;
        let embed = new EmbedBuilder()
            .setTitle('Tableau des scores')
            .setDescription(
                'Nous allons visualiser dans un premier temps le score des joueurs. \n(Plus de détails avec la commande `/trivia-statistics)`'
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
                    'Nous allons visualiser dans un premier temps le score des joueurs. \n(Plus de détails avec la commande `/trivia-statistics)`'
                )
                .setColor(Colors.DarkGold)
                .setFields(
                    {
                        name: 'Leaderboard',
                        value:
                            'Les trois meilleurs joueurs du mois sont : \n\n' +
                            this.playerClassement.slice(0, 3).reduce((text: string, player: [string, TriviaPlayerStatisticType]) => {
                                text += `${MEDAL[index]} ${player[0]} avec \`${player[1][this.month].elo}\` points\n`;
                                index++;
                                return text;
                            }, ''),
                    },
                    {
                        name: 'Scoreboard',
                        value:
                            'Voila le reste du classement :\n\n' +
                            this.playerClassement.slice(3, -1).reduce((text: string, player: [string, TriviaPlayerStatisticType]) => {
                                text += `${index + 1} : ${player[0]} avec \`${player[1][this.month].elo}\` points\n`;
                                index++;
                                return text;
                            }, ''),
                    }
                );
        }
        this.listEmbed.push(embed);
    }

    /**
     * Create embed for the quickest player
     */
    public embedQuickPlayer(): void {
        this.playerClassement.sort(
            (a: [string, TriviaPlayerStatisticType], b: [string, TriviaPlayerStatisticType]) =>
                Math.min(...a[1][this.month].answer_time) - Math.min(...b[1][this.month].answer_time)
        );

        const quickPlayer: [string, TriviaPlayerStatisticType] = this.playerClassement[0];

        if (quickPlayer?.length <= 0) {
            return;
        }

        this.listEmbed.push(
            new EmbedBuilder()
                .setTitle('Le joueur le plus rapide')
                .setDescription(
                    `Tel un EBR 75, \`${quickPlayer[0]}\` détruit ces ennemies plus vite que l'éclair.` +
                        `Ainsi il a répondu le plus rapidement en \`${
                            Math.min(...quickPlayer[1][this.month].answer_time) / TimeEnum.SECONDE
                        }\` secondes.`
                )
                .setColor(Colors.DarkGold)
                .setImage('https://images6.alphacoders.com/131/1315267.jpeg')
        );
    }

    /**
     * Create embed for the slowest player
     */
    public embedSlowPlayer(): void {
        const slowPlayer: [string, TriviaPlayerStatisticType] = this.playerClassement[this.playerClassement.length - 1];

        if (slowPlayer?.length <= 0) {
            return;
        }

        this.listEmbed.push(
            new EmbedBuilder()
                .setTitle('Le joueur le plus lent')
                .setDescription(
                    `\`${slowPlayer[0]}\` est un véritable mur d'acier IRL, du coup il prend son temps pour répondre.` +
                        ` Son temps le plus long est de \`${Math.min(...slowPlayer[1][this.month].answer_time) / 1000}\` secondes.`
                )
                .setColor(Colors.DarkGold)
                .setImage('https://static-ptl-eu.gcdn.co/dcont/fb/image/wot_wallpaperseptember2015_eng_1024x600_eng.jpg')
        );
    }

    /**
     * Create embed for the best win strick
     */
    public embedWinStrickPlayer(): void {
        this.playerClassement.sort(
            (a: [string, TriviaPlayerStatisticType], b: [string, TriviaPlayerStatisticType]) =>
                b[1][this.month].win_strick.max - a[1][this.month].win_strick.max
        );
        const winStrickPlayer: [string, TriviaPlayerStatisticType] = this.playerClassement[0];

        if (winStrickPlayer?.length <= 0) {
            return;
        }

        this.listEmbed.push(
            new EmbedBuilder()
                .setTitle("Le joueur avec le plus de bonnes réponses d'affilée")
                .setDescription(
                    `\`${winStrickPlayer[0]}\` est tel un Léopard, il rate jamais ça cible. \`${
                        winStrickPlayer[0]
                    }\` a correctement répondu \`${winStrickPlayer[1][this.month].win_strick.max}\` fois d'affilée. `
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
    public embedOverall(): void {
        const overallStatistic: MonthlyTriviaOverallStatisticType = this.statistic.trivia.overall[this.month];
        if (!overallStatistic) {
            return;
        }

        const embedOverall = new EmbedBuilder()
            .setTitle('Statistique générale')
            .setDescription('Pour finir voici des statistiques inutiles.')
            .setColor(Colors.DarkGold)
            .setFields(
                { name: 'Nombre total de parties :', value: `\`${overallStatistic.number_of_game}\`` },
                {
                    name: 'Nombre de parties sans participation :',
                    value: `\`${overallStatistic.game_without_participation}\``,
                }
            );

        if (overallStatistic.unique_tanks) {
            embedOverall.setFields({
                name: 'Nombre de chars uniques :',
                value: `\`${overallStatistic.unique_tanks.length}\``,
            });
        }

        this.listEmbed.push(embedOverall);
    }

    /**
     * Create the feedback embed
     */
    public embedFeedBack(): void {
        this.listEmbed.push(
            new EmbedBuilder()
                .setTitle('Feedback')
                .setColor(Colors.DarkGold)
                .setDescription(
                    "Merci d'avoir participé tout au long de ce mois. Si vous avez des feedbacks à me faire (positif ou négatif) je suis preneur (❤️ω❤️)"
                )
        );
    }
}
