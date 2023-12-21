import { InventoryInjector, LoggerInjector } from '../../../shared/decorators/injector.decorator';
import { Logger } from '../../../shared/classes/logger';
import { TriviaType } from '../../../shared/types/inventory.type';
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
import { InventorySingleton } from '../../../shared/singleton/inventory.singleton';
import { RandomUtil } from '../../../shared/utils/random.util';
import { TankopediaVehiclesSuccess, VehicleData } from './wot-api.type';
import { WotApiModel } from './wot-api.model';

@LoggerInjector
@InventoryInjector
export class TriviaGameModel {
    /**
     * The data for the trivia
     * @private
     */
    private trivia: TriviaType;
    /**
     * @instance Of the discord text channel
     * @private
     */
    private channel: TextChannel;
    /**
     * All the tanks for the game
     * @private
     */
    private allTanks: VehicleData[];
    /**
     * The selected tanks
     * @private
     */
    private datum: VehicleData;
    /**
     * The message send
     * @private
     */
    private gameMessage: Message<true>;
    /**
     * The timer of the game
     * @private
     */
    private timer: number;
    /**
     * Follow the player answer
     * @private
     */
    private playerAnswer: { [key: string]: any } = {};

    /**
     * The play time
     */
    public readonly MAX_TIME: number = 1000 * 60;

    /**
     * The medal for the player
     * @private
     */
    private readonly MEDAL: string[] = ['🥇', '🥈', '🥉'];
    /**
     * @instance Of the logger
     * @private
     */
    private readonly logger: Logger;
    /**
     * @instance Of the inventory
     * @private
     */
    private readonly inventory: InventorySingleton;
    /**
     * @instance Of the wot api
     * @private
     */
    private readonly wotApi: WotApiModel = new WotApiModel();
    /**
     * The embed for the start game message
     * @private
     */
    private readonly startGameEmbed: EmbedBuilder = new EmbedBuilder().setTitle('Trivia Game').setColor(Colors.Aqua);
    /**
     * The embed for the game result
     * @private
     */
    private readonly answerEmbed = new EmbedBuilder().setTitle('Trivia Game : RÉSULTAT').setColor(Colors.Green);

    /**
     * Fetch the instance of the text channel
     * @param client The client instance of the bot
     */
    public async fetchChannel(client: Client): Promise<void> {
        this.channel = await this.inventory.getChannelForTrivia(client);
        this.trivia = this.inventory.trivia;
    }

    /**
     * Call tha WoT api to fetch the 4 tanks for the game
     * @throws Error if fetching send error
     */
    public async fetchTanks(): Promise<void> {
        this.logger.trace('Start fetching tanks');
        const pages: number[] = RandomUtil.getArrayWithRandomNumber(4, this.trivia.limite, 1);
        const tankopediaResponses: TankopediaVehiclesSuccess[] = [];

        for (const page of pages) {
            tankopediaResponses.push(await this.wotApi.fetchApi(this.trivia.url.replace('pageNumber', String(page))));
        }

        if (tankopediaResponses[0].meta.count !== this.trivia.limite) {
            this.trivia.limite = tankopediaResponses[0].meta.page_total;
            this.inventory.trivia = this.trivia;
        }

        this.allTanks = tankopediaResponses.reduce((data: VehicleData[], vehicles: TankopediaVehiclesSuccess): VehicleData[] => {
            data.push(vehicles.data[Object.keys(vehicles.data)[0]]);
            return data;
        }, []);

        this.logger.trace('Tank for game selected');
        this.datum = this.allTanks[RandomUtil.getRandomNumber(this.allTanks.length - 1)];
    }

    /**
     * Send the game message to the channel
     */
    public async sendMessageToChannel(): Promise<void> {
        this.startGameEmbed.setFields(
            {
                name: ' Règle du jeu',
                value: "Les règles sont simple :\n\t - 1 alpha,\n- 4 chars tier X,\n- 1 bonne réponse,\n- 1 minute.\n**⚠️ Ce n'est pas forcèment le dernier canon utilisé !**",
            },
            {
                name: 'Alpha du char :',
                value: `\`${this.datum.default_profile.ammo[0].damage[1]}\``,
                inline: true,
            }
        );

        const row = this.allTanks.reduce((rowBuilder: ActionRowBuilder<ButtonBuilder>, data: VehicleData) => {
            rowBuilder.addComponents(new ButtonBuilder().setCustomId(data.name).setLabel(data.name).setStyle(ButtonStyle.Primary));
            return rowBuilder;
        }, new ActionRowBuilder<ButtonBuilder>());

        this.gameMessage = await this.channel.send({
            content: '@here',
            embeds: [this.startGameEmbed],
            components: [row],
        });
        this.timer = Date.now();
    }

    /**
     * Collect the play answer during the play time
     */
    public async collectAnswer(): Promise<void> {
        this.playerAnswer = {};
        this.gameMessage
            .createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: this.MAX_TIME,
            })
            .on('collect', async (interaction: ButtonInteraction<'cached'>): Promise<void> => {
                this.logger.trace(`${interaction.user.username} answer to the trivia game with : \`${interaction.customId}\``);
                this.playerAnswer[interaction.user.username] = {
                    responseTime: Date.now() - this.timer,
                    response: interaction.customId,
                    interaction: interaction,
                };
                await interaction.reply({ ephemeral: true, content: `Ta réponse \`${interaction.customId}\` à bien été pris en compte !` });
            });
    }

    /**
     * Update the game message to show the answer and display top 3 players
     */
    public async sendAnswerToChannel(): Promise<void> {
        const playerResponseArray = Object.entries(this.playerAnswer).sort(
            (a: [string, any], b: [string, any]) => a[1].responseTime - b[1].responseTime
        );

        this.answerEmbed.setImage(this.datum.images.big_icon).setDescription(`Le char à deviner était : \`${this.datum.name}\``);

        let description = playerResponseArray.length > 0 ? '' : "Aucun joueur n'a envoyé de réponse !";

        for (let i = 0; i < 3; i++) {
            if (playerResponseArray[i] && playerResponseArray[i][1].response === this.datum.name) {
                description += `${this.MEDAL[i]} ${playerResponseArray[i][0]} en ${
                    playerResponseArray[i][1].responseTime / 1000
                } secondes\n`;
            }
        }

        const playerEmbed = new EmbedBuilder()
            .setTitle('Joueurs')
            .setDescription(description)
            .setColor(playerResponseArray.length === 0 ? Colors.Red : Colors.Gold);

        await this.gameMessage.edit({ embeds: [this.answerEmbed, playerEmbed], components: [] });
    }
}
