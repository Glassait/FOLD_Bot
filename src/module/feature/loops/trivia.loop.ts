import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    Client,
    Colors,
    ComponentType,
    EmbedBuilder,
    TextChannel,
} from 'discord.js';
import { Logger } from '../../shared/classes/logger';
import { Context } from '../../shared/classes/context';
import { InventorySingleton } from '../../shared/singleton/inventory.singleton';
import { TriviaType } from '../../shared/types/inventory.type';
import { WotApiModel } from './model/wot-api.model';
import { SentenceUtil } from '../../shared/utils/sentence.util';
import { TankopediaVehiclesSuccess, VehicleData } from './model/wot-api.type';

module.exports = async (client: Client): Promise<void> => {
    const MAX_TIME: number = 1000 * 60;
    const logger: Logger = new Logger(new Context('TRIVIA-LOOP'));
    const inventory: InventorySingleton = InventorySingleton.instance;
    const wotApi = new WotApiModel();

    const channel: TextChannel = await inventory.getChannelForTrivia(client);
    const trivia: TriviaType = inventory.trivia;
    const medal: string[] = ['🥇', '🥈', '🥉'];

    let start: number;
    let playerResponse: { [key: string]: any } = {};

    logger.info('🔁 Trivia game initialized');
    let index: number = 0;
    while (index !== -1) {
        await new Promise(r => setTimeout(r, 1000 * 60 * 2 /** SentenceUtil.getRandomNumber(1000 * 60 * 60 * 4, 1000 * 60 * 5  60)*/));
        playerResponse = {};

        logger.info('🎮 Trivia game start');
        try {
            const tankopediaResponse: TankopediaVehiclesSuccess = await wotApi.fetchApi(
                trivia.url.replace('pageNumber', String(SentenceUtil.getRandomNumber(trivia.limite, 1)))
            );

            if (tankopediaResponse.meta.count !== trivia.limite) {
                trivia.limite = tankopediaResponse.meta.page_total;
                inventory.trivia = trivia;
            }

            const tanksKeys = Object.keys(tankopediaResponse.data);
            const datum: VehicleData = <VehicleData>(
                Object.entries(tankopediaResponse.data)[SentenceUtil.getRandomNumber(tanksKeys.length - 1)][1]
            );

            logger.trace(`The response is ${datum.name}`);
            const embed = new EmbedBuilder()
                .setTitle('Trivia Game')
                .setFields(
                    {
                        name: ' Règle du jeu',
                        value: "Les règles sont simple :\n\t - 1 alpha,\n- 4 chars tier X,\n- 1 bonne réponse,\n- 1 minute.\n**⚠️ Ce n'est pas forcèment le dernier canon utilisé !**",
                    },
                    {
                        name: 'Alpha du char :',
                        value: `\`${datum.default_profile.ammo[0].damage[1]}\``,
                        inline: true,
                    }
                )
                .setColor(Colors.Aqua);

            const row = new ActionRowBuilder<ButtonBuilder>();

            tanksKeys.forEach((value: string): void => {
                const tank = tankopediaResponse.data[value].name;
                row.addComponents(new ButtonBuilder().setCustomId(tank).setLabel(tank).setStyle(ButtonStyle.Primary));
            });

            const message = await channel.send({ content: '@here', embeds: [embed], components: [row] });
            start = Date.now();

            const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: MAX_TIME });

            collector.on('collect', async (interaction: ButtonInteraction<'cached'>): Promise<void> => {
                const actual = Date.now();
                playerResponse[interaction.user.username] = { responseTime: actual - start, response: interaction.customId };
                await interaction.reply({ ephemeral: true, content: `Ta réponse \`${interaction.customId}\` à bien été pris en compte !` });
            });

            await new Promise(() =>
                setTimeout((): void => {
                    collector.stop();

                    const playerResponseArray = Object.entries(playerResponse).sort(
                        (a: [string, any], b: [string, any]) => a[1].responseTime - b[1].responseTime
                    );

                    const responseEmbed = new EmbedBuilder()
                        .setTitle('Trivia Game : RÉSULTAT')
                        .setImage(datum.images.big_icon)
                        .setDescription(`Le char à deviner était : \`${datum.name}\``)
                        .setColor(Colors.Green);

                    let description = "Aucun joueur n'a envoyé de réponse !";

                    if (playerResponseArray.length > 0) {
                        description = '';

                        for (let i = 0; i < 3; i++) {
                            if (playerResponseArray[i] && playerResponseArray[i][1].response === datum.name) {
                                description += `${medal[i]} ${playerResponseArray[i][0]} en ${
                                    playerResponseArray[i][1].responseTime / 1000
                                } secondes`;
                            }
                        }
                    }

                    const playerEmbed = new EmbedBuilder()
                        .setTitle('Joueurs')
                        .setDescription(description)
                        .setColor(playerResponseArray.length === 0 ? Colors.Red : Colors.Gold);

                    message.edit({ embeds: [responseEmbed, playerEmbed], components: [] });
                }, MAX_TIME)
            );
        } catch (e) {
            logger.error(`Error during trivia loop : ${e}`);
            index = -1;
        }
    }
};
