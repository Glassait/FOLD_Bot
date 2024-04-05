import {
    ActionRowBuilder,
    AutocompleteFocusedOption,
    AutocompleteInteraction,
    BooleanCache,
    CacheType,
    ChatInputCommandInteraction,
    Client,
    Colors,
    CommandInteractionOption,
    ComponentType,
    EmbedBuilder,
    Message,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    StringSelectMenuOptionBuilder,
    TextChannel,
} from 'discord.js';
import {
    AxiosInjector,
    FeatureInjector,
    InventoryInjector,
    LoggerInjector,
    StatisticInjector,
} from '../../../shared/decorators/injector.decorator';
import { Logger } from '../../../shared/classes/logger';
import { FeatureSingleton } from '../../../shared/singleton/feature.singleton';
import { InventorySingleton } from 'src/module/shared/singleton/inventory.singleton';
import { Clan, PlayerBlacklistedDetail } from '../../../shared/types/feature.type';
import { TimeEnum } from '../../../shared/enums/time.enum';
import { StatisticSingleton } from '../../../shared/singleton/statistic.singleton';
import { FoldRecruitmentClanStatisticType } from '../../../shared/types/statistic.type';
import { EmojiEnum } from '../../../shared/enums/emoji.enum';
import { AxiosInstance } from 'axios';
import { ConstantsEnum } from '../../loops/enums/fold-recruitment.enum';
import { WotApiConstants } from '../../../shared/enums/wot-api.enum';
import { application_id_wot } from '../../../core/config.json';
import { WargamingSuccessType } from '../../../shared/types/wargaming-api.type';

@LoggerInjector
@FeatureInjector
@InventoryInjector
@StatisticInjector
@AxiosInjector(TimeEnum.SECONDE * 10)
export class WatchClanModel {
    //region PRIVATE
    /**
     * Embed send to the recruitment chanel to confirm that the clan has been deleted or added
     */
    private confirmationEmbed: EmbedBuilder = new EmbedBuilder().setColor(Colors.Green);
    //endregion

    //region INJECTOR
    private readonly logger: Logger;
    private readonly feature: FeatureSingleton;
    private readonly inventory: InventorySingleton;
    private readonly statistic: StatisticSingleton;
    private readonly axios: AxiosInstance;
    //endregion

    private _channel: TextChannel;

    get channel(): TextChannel {
        return this._channel;
    }

    /**
     * Fetches and sets the channel for fold recruitment from the client.
     *
     * @param {Client} client - The Discord client used to fetch the channel.
     *
     * @example
     * ```typescript
     * const discordClient = new Client();
     * await instance.fetchChannel(discordClient);
     * console.log(instance.channel); // Updated channel information
     * ```
     */
    public async fetchChannel(client: Client): Promise<void> {
        this._channel = await this.inventory.getChannelForFoldRecruitment(client);
    }

    /**
     * Adds a clan to the list of watched clans based on the provided interaction and option mapping.
     *
     * @param {ChatInputCommandInteraction} interaction - The interaction that triggered the command.
     * @param {Object} MAPPING - The mapping object containing options for the command.
     *
     * @example
     * const interaction = // ... obtained interaction object
     * const MAPPING = // ... defined mapping object
     * await instance.addWatchClan(interaction, MAPPING);
     */
    public async addClanToWatch(interaction: ChatInputCommandInteraction, MAPPING: any): Promise<void> {
        const id: CommandInteractionOption = interaction.options.get(MAPPING.ADD.optionsName[0]) as CommandInteractionOption;
        const name: CommandInteractionOption = interaction.options.get(MAPPING.ADD.optionsName[1]) as CommandInteractionOption;

        const added = this.feature.addClan(<string>id.value, { name: <string>name.value });

        if (!added) {
            this.logger.warn('Clan {} already exists', id.value as string);
            await interaction.editReply({ content: 'Le clan existe déjà !' });

            return;
        }

        this.logger.info(`Clan {} - {} added to the clan to watch`, id.value as string, name.value as string);
        await interaction.editReply({
            content: 'Le clan a bien été ajouté ! Le clan sera observé à partir du prochain créneaux (*^▽^*)',
        });

        this.confirmationEmbed
            .setTitle("Ajout de clan à l'observateur")
            .setDescription(`Le clan \`${name.value}\` a été ajouté à la liste des clans à observer !`);

        await this.channel.send({
            embeds: [this.confirmationEmbed],
        });
    }

    /**
     * Removed a clan from the list of watched clans based on the provided interaction and option mapping.
     *
     * @param {ChatInputCommandInteraction} interaction - The interaction that triggered the command.
     * @param {Object} MAPPING - The mapping object containing options for the command.
     *
     * @example
     * const interaction = // ... obtained interaction object
     * const MAPPING = // ... defined mapping object
     * await instance.removeClanFromWatch(interaction, MAPPING);
     */
    public async removeClanFromWatch(interaction: ChatInputCommandInteraction, MAPPING: any): Promise<void> {
        const idOrName: CommandInteractionOption = interaction.options.get(MAPPING.REMOVE.optionsName[0]) as CommandInteractionOption;

        const removed: Clan | undefined = this.feature.removeClan(<string>idOrName.value);

        if (!removed) {
            this.logger.warn("Clan {} doesn't exist in the clan to watch", idOrName.value as string);
            await interaction.editReply({ content: "Le clan n'existe pas et donc ne peux pas être supprimé !" });
            return;
        }

        this.logger.info(`Clan {} - {} removed from the clan to watch`, idOrName.value as string, removed.name);
        await interaction.editReply({ content: 'Le clan a bien été supprimé !' });

        this.confirmationEmbed
            .setTitle("Suppression de clan de l'observateur")
            .setDescription(`Le clan \`${removed.name}\` a été supprimé de la liste des clans à observer !`);

        await this.channel.send({
            embeds: [this.confirmationEmbed],
        });
    }

    /**
     * Show the statistics of the clan sélected in the slash command
     *
     * @param {ChatInputCommandInteraction} interaction - The slash command interaction
     * @param MAPPING - Map to get the option name
     */
    public async clanStatistics(interaction: ChatInputCommandInteraction, MAPPING: any): Promise<void> {
        const idOrName: CommandInteractionOption = interaction.options.get(MAPPING.STATS.optionsName[0]) as CommandInteractionOption;

        const { id, clan } = this.feature.getClanFromIdOrName(<string>idOrName.value);

        if (!id || !clan) {
            this.logger.warn('No clan found with id or name equal to {}', idOrName.value as string);
            await interaction.editReply({ content: `Aucun clan n'ai enregistré avec le nom ou l'id suivant : \`${idOrName.value}\`` });
            return;
        }

        const clanStats: FoldRecruitmentClanStatisticType = this.statistic.getClanStatistics(id);

        if (!clanStats || Object.keys(clanStats).length === 0) {
            this.logger.warn("The following clan {} doesn't have any statistics", clan.name);
            await interaction.editReply({ content: `Aucune statistique n'a été trouvée pour le clan suivant : \`${clan.name}\`` });
            return;
        }

        const select: StringSelectMenuBuilder = new StringSelectMenuBuilder()
            .setCustomId('fold-recruitment-statistics-select')
            .setPlaceholder('Choisissez un mois');

        Object.keys(clanStats)
            .reverse()
            .forEach((month: string) => select.addOptions(new StringSelectMenuOptionBuilder().setLabel(month).setValue(month)));

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

        const message: Message<BooleanCache<CacheType>> = await interaction.editReply({
            components: [row],
            content: 'Choisissez un mois pour voir les statistiques.',
        });

        message
            .createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: TimeEnum.HOUR * 2 })
            .on('collect', async (i: StringSelectMenuInteraction): Promise<void> => {
                const stats = clanStats[i.values[0]];

                const embed = new EmbedBuilder()
                    .setTitle(`Statistiques pour le mois de ${i.values[0]}`)
                    .setColor(Colors.LuminousVividPink)
                    .setDescription(
                        `Voici les statistiques demandées${
                            i.values[0] === 'février 2024'
                                ? `\n${EmojiEnum.WARNING} Les statistiques pour ce mois ne commence qu'à partir du 11/02/2024 !`
                                : ''
                        }`
                    )
                    .setFields({ name: 'Nombre de départ', value: `\`${stats.leaving_player}\``, inline: true });

                await i.update({
                    embeds: [embed],
                });
            });
    }

    /**
     * Callback used for the slash command. Display a list of observed clans in a paginated embed.
     *
     * @param {ChatInputCommandInteraction} interaction - The interaction that triggered the command.
     *
     * @returns {Promise<void>} - A Promise that resolves once the reply is sent.
     */
    public async clanList(interaction: ChatInputCommandInteraction): Promise<void> {
        const listClanNames: string[] = Object.values(this.feature.watchClans)
            .map((clan: Clan) => clan.name)
            .sort((a: string, b: string): number => (a < b ? -1 : 1));

        const third: number = Math.round(listClanNames.length / 3);

        const embedListClan = new EmbedBuilder()
            .setTitle('Liste des clans observés')
            .setDescription(`Nombre de clan total observés : \`${listClanNames.length}\``)
            .setColor(Colors.DarkGold);

        for (let i = 0; i < 3; i++) {
            const startIdx: number = i * third;
            const endIdx: number = Math.min((i + 1) * third, listClanNames.length);
            const clanListSlice: string[] = listClanNames.slice(startIdx, endIdx);

            embedListClan.addFields({ name: `Page ${i + 1}/3`, value: clanListSlice.join('\n'), inline: true });
        }

        await interaction.editReply({ embeds: [embedListClan] });
    }

    public async autocomplete(interaction: AutocompleteInteraction, type: 'clan' | 'add-player' | 'remove-player'): Promise<void> {
        switch (type) {
            case 'clan':
                await this.autocompleteClan(interaction);
                break;
            case 'add-player':
                await this.autocompleteAddPlayer(interaction);
                break;
            case 'remove-player':
                await this.autocompleteRemovePlayer(interaction);
                break;
        }
    }

    /**
     * Callback used for the slash command. Allow user to blacklist player in the fold recruitment
     *
     * @param {ChatInputCommandInteraction} interaction - The slash command interaction
     * @param MAPPING - Mapping used to get option name
     */
    public async addPlayerToBlacklist(
        interaction: ChatInputCommandInteraction,
        MAPPING: {
            BLACKLIST_PLAYER: {
                optionsName: string[];
            };
        }
    ): Promise<void> {
        let idAndName: string = interaction.options.get(MAPPING.BLACKLIST_PLAYER.optionsName[0])?.value as string;
        idAndName = idAndName.trim();
        let reason: string = interaction.options.get(MAPPING.BLACKLIST_PLAYER.optionsName[1])?.value as string;
        reason = reason.trim();

        const [id, name] = idAndName.split('#');
        const added: boolean = this.feature.addBlacklistedPlayer(id, name, reason);

        if (!added) {
            this.logger.debug('Player {} already blacklisted !', idAndName);
            await interaction.editReply({
                content: `Le joueur \`${name}\` est déjà dans la liste noire !`,
            });
            return;
        }

        this.logger.debug('Player {} added to blacklist !', idAndName);
        this.confirmationEmbed
            .setTitle('Ajout de joueur sur liste noire')
            .setDescription(`Le joueur \`${name}\` a été ajouté sur liste noire !`);

        await interaction.deleteReply();
        await this._channel.send({
            embeds: [this.confirmationEmbed],
        });
    }

    /**
     * Callback used for the slash command. Allow user to remove from the blacklist a player in the fold recruitment
     *
     * @param {ChatInputCommandInteraction} interaction - The slash command interaction
     * @param MAPPING - Mapping used to get option name
     */
    public async removePlayerToBlacklist(
        interaction: ChatInputCommandInteraction,
        MAPPING: {
            UNBLACKLIST_PLAYER: { optionsName: string[] };
        }
    ): Promise<void> {
        let idAndName: string = interaction.options.get(MAPPING.UNBLACKLIST_PLAYER.optionsName[0])?.value as string;
        idAndName = idAndName.trim();

        const [id, name] = idAndName.split('#');
        const removed: boolean = this.feature.removeBlacklistedPlayer(id);

        if (!removed) {
            this.logger.debug('Player {} is not blacklisted !', idAndName);
            await interaction.editReply({
                content: `Le joueur \`${idAndName}\` n'est pas sur la liste noire !`,
            });
            return;
        }

        this.logger.debug('Player {} removed form blacklist !', idAndName);
        this.confirmationEmbed
            .setTitle('Suppression de joueur sur liste noire')
            .setDescription(`Le joueur \`${name}\` a été supprimé de la liste noire !`);

        await interaction.deleteReply();
        await this._channel.send({
            embeds: [this.confirmationEmbed],
        });
    }

    /**
     * Handles the autocomplete logic for clan-related interactions.
     *
     * @param {AutocompleteInteraction} interaction - The autocomplete interaction triggered by the user.
     *
     * @example
     * const autocompleteInteraction = // ... obtained autocomplete interaction object
     * await instance.autocomplete(autocompleteInteraction);
     */
    private async autocompleteRemovePlayer(interaction: AutocompleteInteraction): Promise<void> {
        const focusedOption: AutocompleteFocusedOption = interaction.options.getFocused(true);

        const filtered: [string, PlayerBlacklistedDetail][] = Object.entries(this.feature.playerBlacklisted).filter(
            (player: [string, PlayerBlacklistedDetail]) =>
                player[0].includes(focusedOption.value) || player[1].name.includes(focusedOption.value)
        );

        await interaction.respond(
            filtered
                .map((player: [string, PlayerBlacklistedDetail]): { name: string; value: string } => ({
                    name: `${player[1].name} | ${player[0]}`,
                    value: `${player[0]}#${player[1].name}`,
                }))
                .slice(0, 24)
        );
    }

    /**
     * Handles the autocomplete logic for clan-related interactions.
     *
     * @param {AutocompleteInteraction} interaction - The autocomplete interaction triggered by the user.
     *
     * @example
     * const autocompleteInteraction = // ... obtained autocomplete interaction object
     * await instance.autocomplete(autocompleteInteraction);
     */
    private async autocompleteAddPlayer(interaction: AutocompleteInteraction): Promise<void> {
        const focusedOption: AutocompleteFocusedOption = interaction.options.getFocused(true);

        if (focusedOption.value.length < 3) {
            return;
        }

        const searchResult: WargamingSuccessType<{ nickname: string; account_id: number }[]> = (
            await this.axios.get(
                this.inventory.foldRecruitment.search_player_url
                    .replace(ConstantsEnum.PLAYER_NAME, focusedOption.value)
                    .replace(WotApiConstants.APPLICATION_ID, application_id_wot)
            )
        ).data;

        await interaction.respond(
            searchResult.data
                .map((player: { nickname: string; account_id: number }): { name: string; value: string } => ({
                    name: `${player.nickname} | ${player.account_id}`,
                    value: `${player.account_id}#${player.nickname}`,
                }))
                .slice(0, 24)
        );
    }

    /**
     * Handles the autocomplete logic for clan-related interactions.
     *
     * @param {AutocompleteInteraction} interaction - The autocomplete interaction triggered by the user.
     *
     * @example
     * const autocompleteInteraction = // ... obtained autocomplete interaction object
     * await instance.autocomplete(autocompleteInteraction);
     */
    private async autocompleteClan(interaction: AutocompleteInteraction): Promise<void> {
        const focusedOption: AutocompleteFocusedOption = interaction.options.getFocused(true);

        const filtered: [string, Clan][] = Object.entries(this.feature.watchClans).filter(
            (clan: [string, Clan]) => clan[0].includes(focusedOption.value) || clan[1].name.includes(focusedOption.value)
        );

        await interaction.respond(
            filtered
                .map((clan: [string, Clan]): { name: string; value: string } => ({
                    name: `${clan[1].name} | ${clan[0]}`,
                    value: clan[0],
                }))
                .slice(0, 24)
        );
    }
}
