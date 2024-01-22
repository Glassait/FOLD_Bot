import { Client, Colors, EmbedBuilder, Events, TextChannel } from 'discord.js';
import { BotEvent } from './types/bot-event.type';
import { Context } from '../../shared/classes/context';
import { SentenceUtil } from '../../shared/utils/sentence.util';
import { Logger } from '../../shared/classes/logger';
import { StatisticSingleton } from '../../shared/singleton/statistic.singleton';
import { InventorySingleton } from '../../shared/singleton/inventory.singleton';
import { TriviaPlayerStatisticType, TriviaStatisticType } from '../../shared/types/statistic.type';
import { MEDAL } from '../../shared/utils/variables.util';
import { TimeEnum } from '../../shared/enums/time.enum';

const event: BotEvent = {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client): Promise<void> {
        const logger: Logger = new Logger(new Context('READY-EVENT'));
        const statistique: StatisticSingleton = StatisticSingleton.instance;
        const inventory: InventorySingleton = InventorySingleton.instance;

        logger.info(`💪 Logged in as ${client.user?.tag}`);
        const status = SentenceUtil.getRandomStatus();
        logger.info(`Status of the bot set to ${status[0]} and ${status[1]}`);

        client.user?.setPresence({
            activities: [
                {
                    type: status[0],
                    name: status[1],
                },
            ],
            status: 'online',
        });

        const today = new Date();
        if (today.getDate() === 1) {
            const channel: TextChannel = await inventory.getChannelForTrivia(client);

            const month = new Date();
            month.setMonth(today.getMonth() - 1);
            const monthStr: string = month.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

            const stats: TriviaStatisticType = statistique.trivia;

            const playerClassement = Object.entries(stats.player).sort(
                (a: [string, TriviaPlayerStatisticType], b: [string, TriviaPlayerStatisticType]) => b[1][monthStr].elo - a[1][monthStr].elo
            );

            const embedInt = new EmbedBuilder()
                .setTitle(`Résumé du mois de ${monthStr}`)
                .setDescription('Le dernier mois a été chargé en apprentissage. Découvrons les statistiques du mois.')
                .setImage('https://us-wotp.wgcdn.co/dcont/fb/image/wall_february_2018_1024x600.jpg')
                .setColor(Colors.DarkGold);

            let index = 0;
            const embedScoreboard = new EmbedBuilder()
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
                            playerClassement.slice(0, 3).reduce((text: string, player: [string, TriviaPlayerStatisticType]) => {
                                text += `${MEDAL[index]} ${player[0]} avec \`${player[1][monthStr].elo}\` points\n`;
                                index++;
                                return text;
                            }, ''),
                    },
                    {
                        name: 'Scoreboard',
                        value:
                            'Voila le reste du classement :\n\n' +
                            playerClassement.slice(3, -1).reduce((text: string, player: [string, TriviaPlayerStatisticType]) => {
                                text += `${index + 1} : ${player[0]} avec \`${player[1][monthStr].elo}\` points\n`;
                                index++;
                                return text;
                            }, ''),
                    }
                );

            playerClassement.sort(
                (a: [string, TriviaPlayerStatisticType], b: [string, TriviaPlayerStatisticType]) =>
                    Math.min(...a[1][monthStr].answer_time) - Math.min(...b[1][monthStr].answer_time)
            );

            const quickPlayer: [string, TriviaPlayerStatisticType] = playerClassement[0];
            const embedQuick = new EmbedBuilder()
                .setTitle('Le joueur le plus rapide')
                .setDescription(
                    `Tel un EBR 75, \`${quickPlayer[0]}\` détruit ces ennemies plus vite que l'éclair.` +
                        `Ainsi il a répondu le plus rapidement en \`${
                            Math.min(...quickPlayer[1][monthStr].answer_time) / TimeEnum.SECONDE
                        }\` secondes.`
                )
                .setColor(Colors.DarkGold)
                .setImage('https://images6.alphacoders.com/131/1315267.jpeg');

            const slowPlayer: [string, TriviaPlayerStatisticType] = playerClassement[playerClassement.length - 1];
            const embedSlow = new EmbedBuilder()
                .setTitle('Le joueur le plus lent')
                .setDescription(
                    `\`${slowPlayer[0]}\` est un véritable mur d'acier IRL, du coup il prend son temps pour répondre.` +
                        `Son temps le plus long est de \`${Math.min(...slowPlayer[1][monthStr].answer_time) / 1000}\` secondes.`
                )
                .setColor(Colors.DarkGold)
                .setImage('https://static-ptl-eu.gcdn.co/dcont/fb/image/wot_wallpaperseptember2015_eng_1024x600_eng.jpg');

            playerClassement.sort(
                (a: [string, TriviaPlayerStatisticType], b: [string, TriviaPlayerStatisticType]) =>
                    b[1][monthStr].win_strick.max - a[1][monthStr].win_strick.max
            );
            const winStrickPlayer: [string, TriviaPlayerStatisticType] = playerClassement[0];
            const embedWinStrick = new EmbedBuilder()
                .setTitle("Le joueur avec le plus de bonnes réponses d'affilée")
                .setDescription(
                    `\`${winStrickPlayer[0]}\` est tel un Léopard, il rate jamais ça cible. \`${winStrickPlayer[0]}\` a correctement répondu \`${winStrickPlayer[1][monthStr].win_strick.max}\` fois d'affilée. `
                )
                .setColor(Colors.DarkGold)
                .setImage(
                    'https://worldoftanks.eu/dcont/fb/media/july_2013_wallpaper/normal/july2013_1920x1080_cl.jpg?MEDIA_PREFIX=/dcont/fb/'
                );

            const embedOverall = new EmbedBuilder()
                .setTitle('Statistique générale')
                .setDescription('Pour finir voici des statistiques inutiles.')
                .setColor(Colors.DarkGold)
                .setFields(
                    { name: 'Nombre total de parties :', value: `\`${stats.overall[monthStr].number_of_game}\`` },
                    {
                        name: 'Nombre de parties sans participation :',
                        value: `\`${stats.overall[monthStr].game_without_participation}\``,
                    }
                );

            const embedFeedback = new EmbedBuilder()
                .setTitle('Feedback')
                .setColor(Colors.DarkGold)
                .setDescription(
                    "Merci d'avoir participé tout au long de ce mois. Si vous avez des feedbacks à me faire (positif ou négatif) je suis preneur (❤️ω❤️)"
                );

            await channel.send({
                content: '@here',
                embeds: [embedInt, embedScoreboard, embedQuick, embedSlow, embedWinStrick, embedOverall, embedFeedback],
            });
        }
    },
};

export default event;
