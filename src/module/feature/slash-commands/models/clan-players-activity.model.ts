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
import { WargamingPlayers } from '../../../shared/apis/wargaming/models/wargaming.type';
import { EmojiEnum } from '../../../shared/enums/emoji.enum';

@LoggerInjector
export class ClanPlayersActivityModel {
    //region INJECTION
    @Api('Wargaming') private readonly wargamingApi: WargamingApi;
    private readonly logger: Logger;
    //endregion

    /**
     * Show all players that are under the given activity.
     *
     * The activity is the sum of the battles in fort sorties, fort battles and clan war
     *
     * @param {number} minimumBattles - The upper limits of activity
     * @param {ChatInputCommandInteraction} interaction - The interaction created with the slash-command
     */
    public async showPlayersUnderActivity(minimumBattles: number, interaction: ChatInputCommandInteraction): Promise<void> {
        const [clanStatisticRandom, clanStatisticFortSorties, clanStatisticFortBattles, clanStatisticGlobalMap] = await Promise.all([
            this.wargamingApi.players(500312605, 'random', 28),
            this.wargamingApi.players(500312605, 'fort_sorties', 28),
            this.wargamingApi.players(500312605, 'fort_battles', 28),
            this.wargamingApi.players(500312605, 'global_map', 28),
        ]);

        const errors = [clanStatisticRandom, clanStatisticFortSorties, clanStatisticFortBattles, clanStatisticGlobalMap]
            .filter((statistic: Awaited<WargamingPlayers>): boolean => statistic.status !== 'ok')
            .map((statistic: Awaited<WargamingPlayers>): string => {
                switch (statistic) {
                    case clanStatisticRandom:
                        return 'Random battle failed to be fetched';
                    case clanStatisticFortSorties:
                        return 'Fort sorties battle failed to be fetched';
                    case clanStatisticFortBattles:
                        return 'Fort battles failed to be fetched';
                    case clanStatisticGlobalMap:
                        return 'Global map failed to be fetched';
                    default:
                        return '';
                }
            });

        if (errors.length > 0) {
            this.logger.warn(errors.join(', '));
            await interaction.editReply({
                content:
                    'Une indisponibilité de Wargaming est survenue, merci de réessayer plus tard. Si le problème persiste, merci de contacter <@313006042340524033>',
            });
            return;
        }

        const clanPlayersActivities: ClanPlayersActivity[] = clanStatisticRandom.items
            .filter(({ days_in_clan }): boolean => days_in_clan > 30)
            .map(
                ({ battles_count, name }, index: number): ClanPlayersActivity => ({
                    name,
                    random: battles_count,
                    fortSorties: clanStatisticFortSorties.items[index].battles_count,
                    fortBattles: clanStatisticFortBattles.items[index].battles_count,
                    globalMap: clanStatisticGlobalMap.items[index].battles_count,
                    total:
                        clanStatisticGlobalMap.items[index].battles_count +
                        clanStatisticFortSorties.items[index].battles_count +
                        clanStatisticFortBattles.items[index].battles_count,
                })
            )
            .filter(({ total }): boolean => total < minimumBattles);

        if (!clanPlayersActivities.length) {
            await interaction.editReply({
                content: transformToCode(
                    "Il semblerait que l'ensemble des joueurs du clan ait une activité surpérieure à {} batailles",
                    minimumBattles
                ),
            });
            return;
        }

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

        const actionRow: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId('download').setLabel('Format CSV').setStyle(ButtonStyle.Primary)
        );

        const message = await interaction.editReply({
            embeds,
            components: [actionRow],
        });

        await this.manageDownloadCSV(message, clanPlayersActivities);
    }

    /**
     * Create the embed to send
     *
     * @param {number} minimumBattles - The minimal number of battles wanted. Used only for display
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
