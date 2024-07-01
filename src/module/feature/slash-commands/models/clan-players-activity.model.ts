import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    Colors,
    ComponentType,
    EmbedBuilder,
    Message,
} from 'discord.js';
import { Api } from '../../../shared/decorators/injector/api-injector.decorator';
import { WargamingApi } from '../../../shared/apis/wargaming/wargaming.api';
import { ClanPlayersActivity } from '../types/clan-players-activity.type';
import { LoggerInjector } from '../../../shared/decorators/injector/logger-injector.decorator';
import { Logger } from '../../../shared/utils/logger';
import { escape, transformToCode } from '../../../shared/utils/string.util';
import { TimeEnum } from '../../../shared/enums/time.enum';
import { createCsv } from '../../../shared/utils/csv.util';
import { WargamingPlayer, WargamingPlayers } from '../../../shared/apis/wargaming/models/wargaming.type';
import { EmojiEnum } from '../../../shared/enums/emoji.enum';
import { wording } from '../../../shared/utils/config';

@LoggerInjector
export class ClanPlayersActivityModel {
    //region INJECTION
    @Api('Wargaming') private readonly wargamingApi: WargamingApi;
    private readonly logger: Logger;
    //endregion

    /**
     * Action row to handle the downloading of csv file
     */
    private readonly downloadCVSActionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId(wording('clan-player-activity.buttons.download-csv.id'))
            .setLabel(wording('clan-player-activity.buttons.download-csv.label'))
            .setStyle(ButtonStyle.Primary)
    );

    /**
     * Show all players that are under the given activity.
     *
     * The activity is the sum of the battles in fort sorties, fort battles and clan war
     *
     * @param {number} minimumBattles - The upper limits of activity
     * @param {ChatInputCommandInteraction} interaction - The interaction created with the slash-command
     */
    public async showPlayersUnderActivity(minimumBattles: number, interaction: ChatInputCommandInteraction): Promise<void> {
        const { clanStatisticRandom, clanStatisticFortSorties, clanStatisticFortBattles, clanStatisticGlobalMap } =
            await this.fetchDataFromWargaming();
        const errors = this.checkError(clanStatisticRandom, clanStatisticFortSorties, clanStatisticFortBattles, clanStatisticGlobalMap);

        if (errors.length > 0) {
            this.logger.warn(errors.join(', '));
            await interaction.editReply({
                content: wording('clan-player-activity.texts.wargaming-unavailable'),
            });
            return;
        }

        const clanPlayersActivities = this.filterData(
            clanStatisticRandom,
            clanStatisticFortSorties,
            clanStatisticFortBattles,
            clanStatisticGlobalMap,
            minimumBattles
        );

        if (!clanPlayersActivities.length) {
            await interaction.editReply({
                content: transformToCode(wording('clan-player-activity.texts.no-players-found'), minimumBattles),
            });
            return;
        }

        const embeds = this.buildEmbeds(minimumBattles, clanPlayersActivities);

        const message = await interaction.editReply({
            embeds,
            components: [this.downloadCVSActionRow],
        });

        await this.manageDownloadCSV(message, clanPlayersActivities);
    }

    /**
     * Fetch the clan data from wargaming api
     *
     * @return A promise with all the data needed
     */
    private async fetchDataFromWargaming(): Promise<{
        clanStatisticRandom: Awaited<WargamingPlayers>;
        clanStatisticGlobalMap: Awaited<WargamingPlayers>;
        clanStatisticFortSorties: Awaited<WargamingPlayers>;
        clanStatisticFortBattles: Awaited<WargamingPlayers>;
    }> {
        const [clanStatisticRandom, clanStatisticFortSorties, clanStatisticFortBattles, clanStatisticGlobalMap] = await Promise.all([
            this.wargamingApi.players(500312605, 'random', 28),
            this.wargamingApi.players(500312605, 'fort_sorties', 28),
            this.wargamingApi.players(500312605, 'fort_battles', 28),
            this.wargamingApi.players(500312605, 'global_map', 28),
        ]);
        return { clanStatisticRandom, clanStatisticFortSorties, clanStatisticFortBattles, clanStatisticGlobalMap };
    }

    /**
     * Check if the data fetch contain failed http response, in this case return the corresponding error
     *
     * @param {WargamingPlayers} clanStatisticRandom - The Wargaming data about the activities of the clan player in Random
     * @param {WargamingPlayers} clanStatisticFortSorties - The Wargaming data about the activities of the clan player in FortSorties
     * @param {WargamingPlayers} clanStatisticFortBattles - The Wargaming data about the activities of the clan player in FortBattles
     * @param {WargamingPlayers} clanStatisticGlobalMap - The Wargaming data about the activities of the clan player in GlobalMap
     *
     * @return {string} The error corresponding to the error found, empty string otherwise
     */
    private checkError(
        clanStatisticRandom: Awaited<WargamingPlayers>,
        clanStatisticFortSorties: Awaited<WargamingPlayers>,
        clanStatisticFortBattles: Awaited<WargamingPlayers>,
        clanStatisticGlobalMap: Awaited<WargamingPlayers>
    ): string[] {
        return [clanStatisticRandom, clanStatisticFortSorties, clanStatisticFortBattles, clanStatisticGlobalMap]
            .filter((statistic: Awaited<WargamingPlayers>): boolean => statistic.status !== 'ok')
            .map((statistic: Awaited<WargamingPlayers>): string => {
                switch (statistic) {
                    case clanStatisticRandom:
                        return wording('clan-player-activity.errors.fetch-random-failed');
                    case clanStatisticFortSorties:
                        return wording('clan-player-activity.errors.fetch-fort-sorties-failed');
                    case clanStatisticFortBattles:
                        return wording('clan-player-activity.errors.fetch-fort-battles-failed');
                    case clanStatisticGlobalMap:
                        return wording('clan-player-activity.errors.fetch-global-map-failed');
                    default:
                        return '';
                }
            });
    }

    /**
     * This method will filter the data fetch from wargaming api and map it to gathered data of one player in one object
     *
     * @param {WargamingPlayers} clanStatisticRandom - The Wargaming data about the activities of the clan player in Random
     * @param {WargamingPlayers} clanStatisticFortSorties - The Wargaming data about the activities of the clan player in FortSorties
     * @param {WargamingPlayers} clanStatisticFortBattles - The Wargaming data about the activities of the clan player in FortBattles
     * @param {WargamingPlayers} clanStatisticGlobalMap - The Wargaming data about the activities of the clan player in GlobalMap
     * @param {number} minimumBattles - The minimal number of battles wanted.
     *
     * @return {ClanPlayersActivity[]} - The map of player activities gathered.
     */
    private filterData(
        clanStatisticRandom: Awaited<WargamingPlayers>,
        clanStatisticFortSorties: Awaited<WargamingPlayers>,
        clanStatisticFortBattles: Awaited<WargamingPlayers>,
        clanStatisticGlobalMap: Awaited<WargamingPlayers>,
        minimumBattles: number
    ): ClanPlayersActivity[] {
        return clanStatisticRandom.items
            .filter(({ days_in_clan }): boolean => days_in_clan > 30)
            .map(({ battles_count, name }): ClanPlayersActivity => {
                const { battles_count: fortSorties } = clanStatisticFortSorties.items.find(
                    ({ name: playerName }): boolean => playerName === name
                )!;
                const { battles_count: fortBattles } = clanStatisticFortBattles.items.find(
                    ({ name: playerName }: WargamingPlayer): boolean => playerName === name
                )!;
                const { battles_count: globalMap } = clanStatisticGlobalMap.items.find(
                    ({ name: playerName }: WargamingPlayer): boolean => playerName === name
                )!;

                return {
                    name,
                    random: battles_count,
                    fortSorties,
                    fortBattles,
                    globalMap,
                    total: fortSorties + fortBattles + globalMap,
                };
            })
            .filter(({ total }): boolean => total < minimumBattles);
    }

    /**
     * This method create all the embeds used by the bot to display the player.
     *
     * @param {number} minimumBattles - The upper limits of activity;
     * @param {ClanPlayersActivity[]} clanPlayersActivities - The list of players activities;
     *
     * @return {EmbedBuilder[]} - The list of embed send to the user.
     */
    private buildEmbeds(minimumBattles: number, clanPlayersActivities: ClanPlayersActivity[]): EmbedBuilder[] {
        const embeds: EmbedBuilder[] = [];
        let numberOfFields: number = 0;
        let embed: EmbedBuilder = this.createEmbed(minimumBattles);

        clanPlayersActivities.forEach(({ fortBattles, fortSorties, name, random, globalMap, total }): void => {
            embed.addFields({
                name: escape(name),
                value: transformToCode(
                    'Aléatoires : {}, Escarmouches : {}, Incursions : {}, CW : {}, Total format clan : {}',
                    random,
                    fortSorties,
                    fortBattles,
                    globalMap,
                    total
                ),
                inline: true,
            });

            if (++numberOfFields > 24) {
                embeds.push(embed);
                embed = this.createEmbed(minimumBattles);
                numberOfFields = 0;
            }
        });

        if (numberOfFields < 25) {
            embeds.push(embed);
        }

        return embeds;
    }

    /**
     * Create the embed to send
     *
     * @param {number} minimumBattles - The minimal number of battles wanted. Used only for display
     *
     * @return {EmbedBuilder} - The base embed for the message
     */
    private createEmbed(minimumBattles: number): EmbedBuilder {
        return new EmbedBuilder()
            .setTitle(transformToCode('Liste des joueurs avec une activité en dessous de {} batailles', minimumBattles))
            .setDescription(
                `Si un joueur est affiché, cela signifie que la somme des clan war, des escarmouches et des incursions est inférieure au nombre fourni ! ${EmojiEnum.WARNING} Les batailles aléatoires ne sont pas pris en compte dans le calcul du total !`
            )
            .setColor(Colors.Fuchsia);
    }

    /**
     * This method generate the csv file and manage the clic on the button to download the file
     *
     * @param {Message} message - The message send with the embeds and the button
     * @param {ClanPlayersActivity[]} clanPlayersActivities - The list of player who are under the wanted activity
     */
    private async manageDownloadCSV(message: Message, clanPlayersActivities: ClanPlayersActivity[]): Promise<void> {
        const blob: Blob = new Blob(
            [createCsv(clanPlayersActivities, ['Pseudo', 'Aleatoire', 'Escarmouche', 'Incursion', 'Clan War', 'Total format clan'])],
            {
                type: 'text/csv',
            }
        );

        const attachment = new AttachmentBuilder(Buffer.from(await blob.arrayBuffer()), {
            name: 'clan-player-activity.csv',
        });

        message
            .createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: TimeEnum.HOUR,
            })
            .on('collect', async (interaction: ButtonInteraction): Promise<void> => {
                await interaction.reply({
                    files: [attachment],
                    ephemeral: true,
                });
            });
    }
}
