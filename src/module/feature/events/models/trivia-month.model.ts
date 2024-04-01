import { InventoryInjector, LoggerInjector, StatisticInjector } from '../../../shared/decorators/injector.decorator';
import { InventorySingleton } from '../../../shared/singleton/inventory.singleton';
import { ChannelType, Client, Colors, EmbedBuilder, TextChannel, ThreadAutoArchiveDuration } from 'discord.js';
import { StatisticSingleton } from '../../../shared/singleton/statistic.singleton';
import { DailyTrivia, MonthlyTriviaOverallStatistic, TriviaPlayerStatisticType } from '../../../shared/types/statistic.type';
import { MEDAL } from '../../../shared/utils/variables.util';
import { Logger } from '../../../shared/classes/logger';
import { DateUtil } from '../../../shared/utils/date.util';
import { TimeEnum } from '../../../shared/enums/time.enum';

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
     * The trivia text channel, used to send the month message into
     */
    private channel: TextChannel;
    /**
     * The previous month
     */
    private month: string = DateUtil.getPreviousMonth();
    /**
     * The list of all player's statistics
     */
    private playerClassement: [string, TriviaPlayerStatisticType][];
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
     * @returns {Promise<void>} - A promise that resolves once the mandatory tasks are completed.
     *
     * @example
     * const discordClient = // ... obtained Discord client instance
     * await instance.fetchMandatory(discordClient); // Fetching data to run properly
     */
    public async fetchMandatory(client: Client): Promise<void> {
        this.logger.info('First of the month, creation of the trivia month message');
        this.channel = await this.inventory.getChannelForTrivia(client);

        this.playerClassement = Object.entries(this.statistic.trivia.player)
            .filter((player: [string, TriviaPlayerStatisticType]) => player[1][this.month])
            .sort(
                (a: [string, TriviaPlayerStatisticType], b: [string, TriviaPlayerStatisticType]) =>
                    b[1][this.month].elo - a[1][this.month].elo
            );
    }

    /**
     * Sends the trivia month message to the designated channel.
     * Also creates a thread for feedback and discussions.
     */
    public async sendToChannel(): Promise<void> {
        this.logger.debug('Sending trivia month message...');
        await this.channel.send({ embeds: this.listEmbed });

        const thread = await this.channel.threads.create({
            name: 'Retour sur le jeu',
            autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
            type: ChannelType.PublicThread,
        });

        await thread.send({ content: 'Vous pouvez mettre ici tous les avis, retour ou critiques que vous voulez. Je lis tout :)' });
    }

    /**
     * Creates multiple embeds for various statistics and information related to the trivia game.
     *
     * @example
     * const triviaMonth = new TriviaMonthModel();
     * await triviaMonth.fetchMandatory(client)
     * triviaMonth.createEmbed();
     */
    public createEmbed(): void {
        this.embedIntroduction();
        this.embedScoreboard();
        this.embedQuickPlayer();
        this.embedSlowPlayer();
        this.embedWinStreakPlayer();
        this.embedOverall();
        this.embedFeedBack();
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
        let index = 0;
        let embed = new EmbedBuilder()
            .setTitle('Tableau des scores')
            .setDescription(
                'Nous allons visualiser dans un premier temps le score des joueurs. \n(Plus de détails avec la commande `/trivia statistics)`'
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
                        this.playerClassement.slice(0, 3).reduce((text: string, player: [string, TriviaPlayerStatisticType]) => {
                            text += `${MEDAL[index]} ${player[0]} avec \`${player[1][this.month].elo}\` points\n`;
                            index++;
                            return text;
                        }, ''),
                });

            if (this.playerClassement.slice(3, -1)) {
                embed.addFields({
                    name: 'Scoreboard',
                    value:
                        'Voila le reste du classement :\n\n' +
                        this.playerClassement.slice(3, -1).reduce((text: string, player: [string, TriviaPlayerStatisticType]) => {
                            text += `${index + 1} : ${player[0]} avec \`${player[1][this.month].elo}\` points\n`;
                            index++;
                            return text;
                        }, ''),
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
            (a: [string, TriviaPlayerStatisticType], b: [string, TriviaPlayerStatisticType]) =>
                Math.min(...Object.values(a[1][this.month].daily).flatMap((value: DailyTrivia) => value.answer_time)) -
                Math.min(...Object.values(b[1][this.month].daily).flatMap((value: DailyTrivia) => value.answer_time))
        );

        const quickPlayer: [string, TriviaPlayerStatisticType] = this.playerClassement[0];

        if (!quickPlayer || quickPlayer?.length <= 0) {
            return;
        }

        this.listEmbed.push(
            new EmbedBuilder()
                .setTitle('Le joueur le plus rapide')
                .setDescription(
                    `Tel un EBR 75, \`${quickPlayer[0]}\` détruit ces ennemies plus vite que l'éclair.` +
                        `Ainsi il a répondu le plus rapidement en \`${
                            Math.min(
                                ...Object.values(quickPlayer[1][this.month].daily).flatMap((value: DailyTrivia) => value.answer_time)
                            ) / TimeEnum.SECONDE
                        }\` secondes.`
                )
                .setColor(Colors.DarkGold)
                .setImage('https://images6.alphacoders.com/131/1315267.jpeg')
        );
    }

    /**
     * Create embed for the slowest player
     */
    private embedSlowPlayer(): void {
        const slowPlayer: [string, TriviaPlayerStatisticType] = this.playerClassement[this.playerClassement.length - 1];

        if (!slowPlayer || slowPlayer?.length <= 0) {
            return;
        }

        this.listEmbed.push(
            new EmbedBuilder()
                .setTitle('Le joueur le plus lent')
                .setDescription(
                    `\`${slowPlayer[0]}\` est un véritable mur d'acier IRL, du coup il prend son temps pour répondre.` +
                        ` Son temps le plus long est de \`${
                            Math.min(...Object.values(slowPlayer[1][this.month].daily).flatMap((value: DailyTrivia) => value.answer_time)) /
                            1000
                        }\` secondes.`
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
            (a: [string, TriviaPlayerStatisticType], b: [string, TriviaPlayerStatisticType]) =>
                b[1][this.month].win_streak.max - a[1][this.month].win_streak.max
        );
        const winStreakPlayer: [string, TriviaPlayerStatisticType] = this.playerClassement[0];

        if (!winStreakPlayer || winStreakPlayer?.length <= 0) {
            return;
        }

        this.listEmbed.push(
            new EmbedBuilder()
                .setTitle("Le joueur avec le plus de bonnes réponses d'affilée")
                .setDescription(
                    `\`${winStreakPlayer[0]}\` est tel un Léopard, il rate jamais ça cible. \`${
                        winStreakPlayer[0]
                    }\` a correctement répondu \`${winStreakPlayer[1][this.month].win_streak.max}\` fois d'affilée. `
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

        const embedOverall = new EmbedBuilder()
            .setTitle('Statistique générale')
            .setDescription('Pour finir voici des statistiques inutiles.')
            .setColor(Colors.DarkGold)
            .setFields(
                { name: 'Nombre total de parties :', value: `\`${overallStatistic.number_of_game}\`` },
                {
                    name: 'Nombre de jours sans participation :',
                    value: `\`${overallStatistic.day_without_participation}\``,
                }
            );

        this.listEmbed.push(embedOverall);
    }

    /**
     * Creates an Embed message to collect feedback in a thread.
     */
    private embedFeedBack(): void {
        this.listEmbed.push(
            new EmbedBuilder()
                .setTitle("Retour d'utilisation")
                .setColor(Colors.DarkGold)
                .setDescription(
                    "Merci d'avoir participé tout au long de ce mois. Si vous avez des feedbacks à me faire (positif ou négatif), merci de les écrire dans le thread juste en dessous. Merci beaucoup (❤️ω❤️)"
                )
        );
    }
}
