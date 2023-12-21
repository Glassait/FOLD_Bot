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
import { Logger } from '../../shared/classes/logger';
import { Context } from '../../shared/classes/context';
import { InventorySingleton } from '../../shared/singleton/inventory.singleton';
import { TriviaType } from '../../shared/types/inventory.type';
import { WotApiModel } from './model/wot-api.model';
import { TankopediaVehiclesSuccess, VehicleData } from './model/wot-api.type';
import { RandomUtil } from '../../shared/utils/random.util';
import { EnvUtil } from '../../shared/utils/env.util';

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
        await EnvUtil.sleep(1000 * 60 * 2); // new Promise(r => setTimeout(r, 1000 * 60 * 2 /** SentenceUtil.getRandomNumber(1000 * 60 * 60 * 4, 1000 * 60 * 5  60)*/));
        playerResponse = {};

        logger.info('🎮 Trivia game start');
        try {
            const pages: number[] = RandomUtil.getArrayWithRandomNumber(4, trivia.limite, 1);
            const tankopediaResponses: TankopediaVehiclesSuccess[] = [];

            for (const page of pages) {
                tankopediaResponses.push(await wotApi.fetchApi(trivia.url.replace('pageNumber', String(page))));
            }

            if (tankopediaResponses[0].meta.count !== trivia.limite) {
                trivia.limite = tankopediaResponses[0].meta.page_total;
                inventory.trivia = trivia;
            }

            const allTanks: VehicleData[] = tankopediaResponses.reduce(
                (data: VehicleData[], vehicles: TankopediaVehiclesSuccess): VehicleData[] => {
                    data.push(vehicles.data[Object.keys(vehicles.data)[0]]);
                    return data;
                },
                []
            );
            const datum: VehicleData = allTanks[RandomUtil.getRandomNumber(allTanks.length - 1)];

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

            const row = allTanks.reduce((rowBuilder: ActionRowBuilder<ButtonBuilder>, data: VehicleData) => {
                rowBuilder.addComponents(new ButtonBuilder().setCustomId(data.name).setLabel(data.name).setStyle(ButtonStyle.Primary));
                return rowBuilder;
            }, new ActionRowBuilder<ButtonBuilder>());

            const message: Message<true> = await channel.send({ content: '@here', embeds: [embed], components: [row] });
            start = Date.now();

            const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: MAX_TIME });

            collector.on('collect', async (interaction: ButtonInteraction<'cached'>): Promise<void> => {
                playerResponse[interaction.user.username] = { responseTime: Date.now() - start, response: interaction.customId };
                await interaction.reply({ ephemeral: true, content: `Ta réponse \`${interaction.customId}\` à bien été pris en compte !` });
            });

            await EnvUtil.sleep(MAX_TIME);
            logger.trace('🎮 Trivia game end');
            collector.stop();

            const playerResponseArray = Object.entries(playerResponse).sort(
                (a: [string, any], b: [string, any]) => a[1].responseTime - b[1].responseTime
            );

            const responseEmbed = new EmbedBuilder()
                .setTitle('Trivia Game : RÉSULTAT')
                .setImage(datum.images.big_icon)
                .setDescription(`Le char à deviner était : \`${datum.name}\``)
                .setColor(Colors.Green);

            let description = playerResponseArray.length > 0 ? '' : "Aucun joueur n'a envoyé de réponse !";

            for (let i = 0; i < 3; i++) {
                if (playerResponseArray[i] && playerResponseArray[i][1].response === datum.name) {
                    description += `${medal[i]} ${playerResponseArray[i][0]} en ${
                        playerResponseArray[i][1].responseTime / 1000
                    } secondes\n`;
                }
            }

            const playerEmbed = new EmbedBuilder()
                .setTitle('Joueurs')
                .setDescription(description)
                .setColor(playerResponseArray.length === 0 ? Colors.Red : Colors.Gold);

            await message.edit({ embeds: [responseEmbed, playerEmbed], components: [] });
        } catch (e) {
            logger.error(`Error during trivia loop : ${e}`);
            index = -1;
        }
    }
    logger.error('🔁 Trivia loop end');
};
