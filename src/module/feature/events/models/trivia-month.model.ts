import { type Client, Colors, EmbedBuilder, type TextChannel } from 'discord.js';
import { LoggerInjector } from '../../../shared/decorators/injector/logger-injector.decorator';
import { Table } from '../../../shared/decorators/injector/table-injector.decorator';
import { EmojiEnum } from '../../../shared/enums/emoji.enum';
import { TimeEnum } from '../../../shared/enums/time.enum';
import type { ChannelsTable } from '../../../shared/tables/complexe-table/channels/channels.table';
import type { TriviaAnswer } from '../../../shared/tables/complexe-table/players-answers/models/players-answers.type';
import type { PlayersAnswersTable } from '../../../shared/tables/complexe-table/players-answers/players-answers.table';
import type { TriviaPlayer } from '../../../shared/tables/complexe-table/players/models/players.type';
import type { PlayersTable } from '../../../shared/tables/complexe-table/players/players.table';
import type { TriviaTable } from '../../../shared/tables/complexe-table/trivia/trivia.table';
import type { WinStreak } from '../../../shared/tables/complexe-table/win-streak/models/win-streak.type';
import type { WinStreakTable } from '../../../shared/tables/complexe-table/win-streak/win-streak.table';
import { DateUtil } from '../../../shared/utils/date.util';
import type { Logger } from '../../../shared/utils/logger';
import { MathUtil } from '../../../shared/utils/math.util';
import { StringUtil } from '../../../shared/utils/string.util';
import { UserUtil } from '../../../shared/utils/user.util';
import { MEDAL } from '../../../shared/utils/variables.util';

@LoggerInjector
export class TriviaMonthModel {
    //region INJECTABLE
    private readonly logger: Logger;
    @Table('Channels') private readonly channels: ChannelsTable;
    @Table('PlayersAnswer') private readonly playersAnswersTable: PlayersAnswersTable;
    @Table('Players') private readonly playersTable: PlayersTable;
    @Table('WinStreak') private readonly winStreakTable: WinStreakTable;
    @Table('Trivia') private readonly triviaTable: TriviaTable;
    //endregion

    //region PRIVATE
    /**
     * The trivia text channel, used to send the month message into
     */
    private channel: TextChannel;
    /**
     * The previous month
     */
    private month: Date = DateUtil.getPreviousMonthAsDate();
    /**
     * Represents the list of player statistics.
     * Each entry is a tuple containing the player's name and their monthly statistics.
     *
     * The first element of the tuple is the player's name (string).
     *
     * The second element of the tuple is the player's monthly answer (TriviaAnswer).
     */
    private playerClassement: [string, TriviaAnswer[], WinStreak][];

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
        this.channel = await UserUtil.fetchChannelFromClient(client, await this.channels.getTrivia());

        const players: TriviaPlayer[] = await this.playersTable.getAllPlayers();

        const promises: Promise<TriviaAnswer[]>[] = players.map(({ id }) =>
            this.playersAnswersTable.getPeriodAnswerOfPlayer(id, this.month)
        );
        const winPromise: Promise<WinStreak>[] = players.map(({ id }) => this.winStreakTable.getWinStreakFromDate(id, this.month));

        const winstreaks: Awaited<WinStreak>[] = await Promise.all(winPromise);

        this.playerClassement = (await Promise.all(promises)).map((answers: TriviaAnswer[], index: number) => [
            players[index].name,
            answers,
            winstreaks[index],
        ]);

        this.playerClassement.sort(
            ([, aAnswers]: [string, TriviaAnswer[], WinStreak], [, bAnswer]: [string, TriviaAnswer[], WinStreak]) =>
                bAnswer[bAnswer.length - 1].elo - aAnswers[aAnswers.length - 1].elo
        );
    }

    /**
     * Sends the trivia month message to the designated channel.
     */
    public async createEmbedAndSendToChannel(): Promise<void> {
        await this.createEmbed();

        this.logger.debug(`${EmojiEnum.LETTER} Sending trivia month message`);
        await this.channel.send({ embeds: this.listEmbed });
    }

    /**
     * Creates multiple embeds for various statistics and information related to the trivia game.
     */
    private async createEmbed(): Promise<void> {
        this.logger.debug(`${EmojiEnum.HAMMER} Start building embed for trivia month`);
        this.embedIntroduction();
        this.embedScoreboard();

        if (this.playerClassement.length > 0) {
            this.logger.debug('Enough players to build embed for trivia month');
            this.embedQuickPlayer();
            this.embedSlowPlayer();
            this.embedWinStreakPlayer();
        }

        await this.embedOverall();
    }

    /**
     * Create the introduction embed
     */
    private embedIntroduction(): void {
        this.listEmbed.push(
            new EmbedBuilder()
                .setTitle(StringUtil.transformToCode(`Résumé du mois de {}`, DateUtil.convertDateToMonthYearString(this.month)))
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
                                (text: string, [name, answer]) =>
                                    text +
                                    StringUtil.transformToCode(`${MEDAL[index++]} ${name} avec {} points\n`, answer[answer.length - 1].elo),
                                ''
                            ),
                });

            if (this.playerClassement.length > 3) {
                embed.addFields({
                    name: 'Scoreboard',
                    value:
                        'Voila le reste du classement :\n\n' +
                        this.playerClassement
                            .slice(3)
                            .reduce(
                                (text: string, [name, answer]) =>
                                    text +
                                    StringUtil.transformToCode(`${1 + index++} : ${name} avec {} points\n`, answer[answer.length - 1].elo),
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
            ([, aAnswers]: [string, TriviaAnswer[], WinStreak], [, bAnswers]: [string, TriviaAnswer[], WinStreak]) =>
                MathUtil.getMinFromArrayOfObject(aAnswers, 'answer_time') - MathUtil.getMinFromArrayOfObject(bAnswers, 'answer_time')
        );

        const [name, answers] = this.playerClassement[0];

        this.listEmbed.push(
            new EmbedBuilder()
                .setTitle('Le joueur le plus rapide')
                .setDescription(
                    StringUtil.transformToCode(
                        `Tel un EBR 75, {} détruit ces ennemies plus vite que l'éclair. Ainsi il a répondu le plus rapidement en {} secondes.`,
                        name,
                        MathUtil.getMinFromArrayOfObject(answers, 'answer_time') / TimeEnum.SECONDE
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
            ([, aAnswers]: [string, TriviaAnswer[], WinStreak], [, bAnswers]: [string, TriviaAnswer[], WinStreak]) =>
                MathUtil.getMaxFromArrayOfObject(bAnswers, 'answer_time') - MathUtil.getMaxFromArrayOfObject(aAnswers, 'answer_time')
        );
        const [name, answers] = this.playerClassement[0];

        this.listEmbed.push(
            new EmbedBuilder()
                .setTitle('Le joueur le plus lent')
                .setDescription(
                    StringUtil.transformToCode(
                        `{} est un véritable mur d'acier IRL, du coup il prend son temps pour répondre. Son temps le plus long est de {} secondes.`,
                        name,
                        MathUtil.getMaxFromArrayOfObject(answers, 'answer_time') / TimeEnum.SECONDE
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
            ([, , aWin]: [string, TriviaAnswer[], WinStreak], [, , bWin]: [string, TriviaAnswer[], WinStreak]) => bWin.max - aWin.max
        );
        const [name, , win] = this.playerClassement[0];

        this.listEmbed.push(
            new EmbedBuilder()
                .setTitle("Le joueur avec le plus de bonnes réponses d'affilée")
                .setDescription(
                    StringUtil.transformToCode(
                        `{} est tel un Léopard, il rate jamais ça cible. {} a correctement répondu {} fois d'affilée.`,
                        name,
                        name,
                        win.max
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
    private async embedOverall(): Promise<void> {
        const numberOfGame: number = await this.triviaTable.getNumberOfGameFromDate(this.month);

        this.listEmbed.push(
            new EmbedBuilder()
                .setTitle('Statistique générale')
                .setDescription('Pour finir voici des statistiques inutiles.')
                .setColor(Colors.DarkGold)
                .setFields({ name: 'Nombre total de parties :', value: `\`${numberOfGame}\`` })
        );
    }
}
