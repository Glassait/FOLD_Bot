import {
    type AutocompleteFocusedOption,
    type AutocompleteInteraction,
    type ChatInputCommandInteraction,
    type Client,
    Colors,
    EmbedBuilder,
    type TextChannel,
} from 'discord.js';
import type { WotApiModel } from '../../../shared/apis/wot-api.model';
import type { Logger } from '../../../shared/classes/logger';
import { Injectable, LoggerInjector, TableInjectable } from '../../../shared/decorators/injector.decorator';
import type { FeatureSingleton } from '../../../shared/singleton/feature.singleton';
import type { InventorySingleton } from '../../../shared/singleton/inventory.singleton';
import type { StatisticSingleton } from '../../../shared/singleton/statistic.singleton';
import type { WatchClanTable } from '../../../shared/tables/watch-clan.table';
import type { PlayerBlacklistedDetail } from '../../../shared/types/feature.type';
import type { WargamingSuccessType } from '../../../shared/types/wargaming-api.type';
import type { Clan } from '../../../shared/types/watch-clan.type';
import type { PlayerData } from '../../../shared/types/wot-api.type';
import { StringUtil } from '../../../shared/utils/string.util';

@LoggerInjector
export class WatchClanModel {
    //region PRIVATE
    /**
     * Embed send to the recruitment chanel to confirm that the clan has been deleted or added
     */
    private confirmationEmbed: EmbedBuilder = new EmbedBuilder().setColor(Colors.Green);
    //endregion

    //region INJECTABLE
    private readonly logger: Logger;
    @Injectable('Feature') private readonly feature: FeatureSingleton;
    @Injectable('Inventory') private readonly inventory: InventorySingleton;
    @Injectable('Statistic') private readonly statistic: StatisticSingleton;
    @Injectable('WotApi') private readonly wotApi: WotApiModel;
    @TableInjectable('Watch-Clan') private readonly watchClan: WatchClanTable;
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
    public async initialise(client: Client): Promise<void> {
        this._channel = await this.inventory.getChannelForFoldRecruitment(client);
    }

    /**
     * Adds a clan to the list of watched clans based on the provided interaction and option mapping.
     *
     * @param {ChatInputCommandInteraction} interaction - The interaction that triggered the command.
     * @param {string[]} optionsName - The list of options name.
     */
    public async addClanToWatch(interaction: ChatInputCommandInteraction, optionsName: string[]): Promise<void> {
        const id: number = interaction.options.get(optionsName[0])?.value as number;
        let name: string = interaction.options.get(optionsName[1])?.value as string;
        name = StringUtil.sanitize(name).toUpperCase();

        const added: boolean = await this.watchClan.addClan({ id: id, name: name });

        if (!added) {
            this.logger.warn('Clan {} already exists', id);
            await interaction.editReply({ content: 'Le clan existe déjà !' });

            return;
        }

        this.logger.info('Clan {} - {} added to the clan to watch', id, name);
        await interaction.editReply({
            content: 'Le clan a bien été ajouté ! Le clan sera observé à partir du prochain créneaux (*^▽^*)',
        });

        this.confirmationEmbed
            .setTitle("Ajout de clan à l'observateur")
            .setDescription(`Le clan \`${name}\` a été ajouté à la liste des clans à observer !`);

        await this.channel.send({ embeds: [this.confirmationEmbed] });
    }

    /**
     * Removed a clan from the list of watched clans based on the provided interaction and option mapping.
     *
     * @param {ChatInputCommandInteraction} interaction - The interaction that triggered the command.
     * @param {string[]} optionsName - The list of options name.
     */
    public async removeClanFromWatch(interaction: ChatInputCommandInteraction, optionsName: string[]): Promise<void> {
        let idOrName: string = interaction.options.get(optionsName[0])?.value as string;
        idOrName = StringUtil.sanitize(idOrName).toUpperCase();

        const clans: Clan[] = await this.watchClan.selectClan(idOrName);

        if (clans.length === 0) {
            this.logger.warn("Clan {} doesn't exist in the clan to watch", idOrName);
            await interaction.editReply({ content: "Le clan n'apparaît pas dans la liste des clans observés !" });
            return;
        }
        if (clans.length > 0) {
            this.logger.warn('Id or name {} lead to multiple result !', idOrName);
            await interaction.editReply({ content: "Plusieurs résultats sont sortis, merci d'affiner la recherche !" });
            return;
        }

        const clan: Clan = clans.shift() as Clan;
        const removed: boolean = await this.watchClan.removeClan(String(clan.id));

        if (!removed) {
            this.logger.error('Error occurs when removing clan from database');
            await interaction.editReply({
                content:
                    "Une erreur est survenue lors de la suppression du clan de l'observateur. Merci de réessayer plus tard ou de contacter <@313006042340524033>.",
            });
            return;
        }

        this.logger.info('Clan {} - {} removed from the clan to watch', clan.id, clan.name);
        await interaction.editReply({ content: "Le clan a bien été supprimé de l'observateur !" });

        this.confirmationEmbed
            .setTitle("Suppression de clan de l'observateur")
            .setDescription(StringUtil.transformToCode('`Le clan {} a été supprimé de la liste des clans à observer !`', clan.name));

        await this.channel.send({ embeds: [this.confirmationEmbed] });
    }

    /**
     * Callback used for the slash command. Display a list of observed clans in a paginated embed.
     *
     * @param {ChatInputCommandInteraction} interaction - The interaction that triggered the command.
     */
    public async clanList(interaction: ChatInputCommandInteraction): Promise<void> {
        const listClanNames: string[] = (await this.watchClan.getAll())
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

    /**
     * Handles autocomplete interactions based on the provided type.
     *
     * @param {AutocompleteInteraction} interaction - The autocomplete interaction object.
     * @param {'clan' | 'add-player' | 'remove-player'} interactionType - The type of autocomplete interaction.
     */
    public async autocomplete(
        interaction: AutocompleteInteraction,
        interactionType: 'clan' | 'add-player' | 'remove-player'
    ): Promise<void> {
        switch (interactionType) {
            case 'clan':
                await this.autocompleteClan(interaction);
                break;
            case 'add-player':
                await this.autocompleteAddPlayer(interaction);
                break;
            case 'remove-player':
                await this.autocompleteRemovePlayer(interaction);
                break;
            default:
                throw new Error(`Invalid interactionType: ${interactionType}`);
        }
    }

    /**
     * Callback used for the slash command. Allow user to blacklist player in the fold recruitment
     *
     * @param {ChatInputCommandInteraction} interaction - The slash command interaction
     * @param {string[]} optionsName - The list of options name.
     */
    public async addPlayerToBlacklist(interaction: ChatInputCommandInteraction, optionsName: string[]): Promise<void> {
        let idAndName: string = interaction.options.get(optionsName[0])?.value as string;
        idAndName = idAndName.trim();
        let reason: string = interaction.options.get(optionsName[1])?.value as string;
        reason = reason.trim();

        let [id, name] = idAndName.split('#');

        if (!id || !name) {
            const searchResult: WargamingSuccessType<PlayerData[]> = await this.wotApi.fetchPlayerData(idAndName);

            if (!searchResult) {
                await interaction.editReply({ content: "The player pass doesn't exist" });
                return;
            }

            id = String(searchResult.data[0].account_id);
            name = searchResult.data[0].nickname;
        }

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

        await interaction.editReply({ content: 'Je joueur a bien été ajouté à la liste noire !' });
        await this._channel.send({
            embeds: [this.confirmationEmbed],
        });
    }

    /**
     * Callback used for the slash command. Allow user to remove from the blacklist a player in the fold recruitment
     *
     * @param {ChatInputCommandInteraction} interaction - The slash command interaction
     * @param {string[]} optionsName - The list of options name.
     */
    public async removePlayerToBlacklist(interaction: ChatInputCommandInteraction, optionsName: string[]): Promise<void> {
        let idAndName: string = interaction.options.get(optionsName[0])?.value as string;
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

        await interaction.editReply({ content: 'Je joueur a bien été supprimé de la liste noire !' });
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

        const searchResult: WargamingSuccessType<PlayerData[]> = await this.wotApi.fetchPlayerData(focusedOption.value);

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
        const idOrName: string = interaction.options.getFocused(true).value;

        await interaction.respond(
            (await this.watchClan.selectClan(StringUtil.sanitize(idOrName).toUpperCase()))
                .map((clan: Clan): { name: string; value: string } => ({
                    name: `${clan.name} | ${clan.id}`,
                    value: String(clan.id),
                }))
                .slice(0, 24)
        );
    }
}
