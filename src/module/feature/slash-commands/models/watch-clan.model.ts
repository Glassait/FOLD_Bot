import {
    type AutocompleteFocusedOption,
    type AutocompleteInteraction,
    type ChatInputCommandInteraction,
    type Client,
    Colors,
    EmbedBuilder,
    type TextChannel,
} from 'discord.js';
import type { PlayerData } from '../../../shared/apis/wot/models/wot-api.type';
import type { WargamingSuccessType } from '../../../shared/apis/wot/models/wot-base-api.type';
import type { WotApi } from '../../../shared/apis/wot/wot.api';
import { Api } from '../../../shared/decorators/injector/api-injector.decorator';
import { LoggerInjector } from '../../../shared/decorators/injector/logger-injector.decorator';
import { Table } from '../../../shared/decorators/injector/table-injector.decorator';
import type { BlacklistedPlayersTable } from '../../../shared/tables/complexe-table/blacklisted-players/blacklisted-players.table';
import type { BlacklistedPlayer } from '../../../shared/tables/complexe-table/blacklisted-players/models/blacklisted-players.type';
import type { ChannelsTable } from '../../../shared/tables/complexe-table/channels/channels.table';
import type { FeatureFlippingTable } from '../../../shared/tables/complexe-table/feature-flipping/feature-flipping.table';
import type { Clan } from '../../../shared/tables/complexe-table/watch-clans/models/watch-clans.type';
import type { WatchClansTable } from '../../../shared/tables/complexe-table/watch-clans/watch-clans.table';
import type { Logger } from '../../../shared/utils/logger';
import { sanitize, transformToCode } from '../../../shared/utils/string.util';
import { fetchChannelFromClient } from '../../../shared/utils/user.util';

@LoggerInjector
export class WatchClanModel {
    //region INJECTABLE
    @Api('Wot') private readonly wotApi: WotApi;
    @Table('WatchClans') private readonly watchClans: WatchClansTable;
    @Table('BlacklistedPlayers') private readonly blacklistedPlayers: BlacklistedPlayersTable;
    @Table('Channels') private readonly channels: ChannelsTable;
    @Table('FeatureFlipping') private readonly featureFlippingTable: FeatureFlippingTable;
    private readonly logger: Logger;
    //endregion

    /**
     * The default reason to be used when a player is not suitable for the clan without any specific reason provided.
     */
    private readonly defaultReason = 'Ce joueur ne convient pas au clan (aucune de raison fournie)';

    //region PRIVATE
    /**
     * Embed send to the recruitment chanel to confirm that the clan has been deleted or added
     */
    private confirmationEmbed: EmbedBuilder = new EmbedBuilder().setColor(Colors.Green);
    //endregion

    //region GETTER-SETTER
    private _channel?: TextChannel;

    get channel(): TextChannel | undefined {
        return this._channel;
    }
    //endregion

    /**
     * Fetches and sets the channel for fold recruitment from the client.
     *
     * @param {Client} client - The Discord client used to fetch the channel.
     *
     * @example
     * const discordClient = new Client();
     * await instance.fetchChannel(discordClient);
     * console.log(instance.channel); // Updated channel information
     */
    public async initialise(client: Client): Promise<void> {
        this._channel = await fetchChannelFromClient(client, await this.channels.getFoldRecruitment());
    }

    /**
     * Adds a clan to the list of watched clans based on the provided interaction and option mapping.
     *
     * @param {ChatInputCommandInteraction} interaction - The interaction that triggered the command.
     * @param {string[]} optionsName - The list of options name.
     */
    public async addClanToWatch(interaction: ChatInputCommandInteraction, optionsName: string[]): Promise<void> {
        if (!(await this.featureFlippingTable.getFeature('fold_recruitment'))) {
            await interaction.editReply({
                content: "L'observateur n'est pas activé pas l'administrateur <@313006042340524033>",
            });
            return;
        }

        const id: number = interaction.options.get(optionsName[0])?.value as number;
        let name: string = interaction.options.get(optionsName[1])?.value as string;
        name = sanitize(name).toUpperCase();

        const clan: Clan[] = await this.watchClans.selectClan(String(id));

        if (clan.length > 0) {
            this.logger.warn('Clan {} already exists', id);
            await interaction.editReply({ content: 'Le clan existe déjà !' });
            return;
        }

        const added: boolean = await this.watchClans.addClan({ id, name });

        if (!added) {
            this.logger.warn('An error occur during adding clan to the database');
            await interaction.editReply({
                content:
                    "Une erreur est survenue lors de l'ajout du clan à l'observateur. Merci de réessayer plus tard ou de contacter <@313006042340524033>",
            });
            return;
        }

        this.logger.info('Clan {} - {} added to the clan to watch', id, name);
        await interaction.editReply({
            content: 'Le clan a bien été ajouté ! Le clan sera observé à partir du prochain créneaux (*^▽^*)',
        });

        this.confirmationEmbed
            .setTitle("Ajout de clan à l'observateur")
            .setDescription(transformToCode('Le clan {} a été ajouté à la liste des clans à observer !', name));

        await this._channel!.send({ embeds: [this.confirmationEmbed] });
    }

    /**
     * Removed a clan from the list of watched clans based on the provided interaction and option mapping.
     *
     * @param {ChatInputCommandInteraction} interaction - The interaction that triggered the command.
     * @param {string[]} optionsName - The list of options name.
     */
    public async removeClanFromWatch(interaction: ChatInputCommandInteraction, optionsName: string[]): Promise<void> {
        if (!(await this.featureFlippingTable.getFeature('fold_recruitment'))) {
            await interaction.editReply({
                content: "L'observateur n'est pas activé pas l'administrateur <@313006042340524033>",
            });
            return;
        }

        let idOrName: string = interaction.options.get(optionsName[0])?.value as string;
        idOrName = sanitize(idOrName).toUpperCase();

        const clans: Clan[] = await this.watchClans.selectClan(idOrName);

        if (clans.length === 0) {
            this.logger.warn("Clan {} doesn't exist in the clan to watch", idOrName);
            await interaction.editReply({ content: "Le clan n'apparaît pas dans la liste des clans observés !" });
            return;
        }
        if (clans.length > 1) {
            this.logger.warn('Input {} lead to multiple result', idOrName);
            await interaction.editReply({ content: "Le champ renseigné conduit à plusieurs résultats. Merci d'affiner la recherche !" });
            return;
        }

        const clan: Clan = clans.shift()!;
        const removed: boolean = await this.watchClans.removeClan(String(clan.id));

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
            .setDescription(transformToCode('Le clan {} a été supprimé de la liste des clans à observer !', clan.name));

        await this._channel!.send({ embeds: [this.confirmationEmbed] });
    }

    /**
     * Callback used for the slash command. Display a list of observed clans in a paginated embed.
     *
     * @param {ChatInputCommandInteraction} interaction - The interaction that triggered the command.
     */
    public async clanList(interaction: ChatInputCommandInteraction): Promise<void> {
        if (!(await this.featureFlippingTable.getFeature('fold_recruitment'))) {
            await interaction.editReply({
                content: "L'observateur n'est pas activé pas l'administrateur <@313006042340524033>",
            });
            return;
        }

        const listClanNames: string[] = (await this.watchClans.getAll())
            .map((clan: Clan) => clan.name)
            .sort((a: string, b: string): number => (a < b ? -1 : 1));

        if (listClanNames.length === 0) {
            await interaction.editReply({
                content: 'Aucun clan est observé !',
            });
            return;
        }

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
     * Callback used for the slash command. Allow user to blacklist player in the fold recruitment
     *
     * @param {ChatInputCommandInteraction} interaction - The slash command interaction
     * @param {string[]} optionsName - The list of options name.
     */
    public async blacklistPlayer(interaction: ChatInputCommandInteraction, optionsName: string[]): Promise<void> {
        if (!(await this.featureFlippingTable.getFeature('fold_recruitment'))) {
            await interaction.editReply({
                content: "L'observateur n'est pas activé pas l'administrateur <@313006042340524033>",
            });
            return;
        }

        const idAndName: string = interaction.options.get(optionsName[0])?.value as string;

        if (idAndName === 'ERROR') {
            await interaction.editReply({
                content: 'Le pseudo passé contient une ou plusieurs erreurs !',
            });
            return;
        }

        const reason: string | undefined = interaction.options.get(optionsName[1])?.value as string | undefined;

        let [id, name] = idAndName.split('#');

        if (!id || !name) {
            let searchResult: WargamingSuccessType<PlayerData[]> | undefined;

            try {
                searchResult = await this.wotApi.accountList(idAndName);
            } catch (e) {
                await interaction.editReply({
                    content: 'Le pseudo passé contient une ou plusieurs erreurs !',
                });
                return;
            }

            id = String(searchResult.data[0].account_id);
            name = searchResult.data[0].nickname;
        }

        const player: BlacklistedPlayer[] = await this.blacklistedPlayers.getPlayer(Number(id));

        if (player.length > 0) {
            this.logger.debug('Player {} already blacklisted !', player[0].name);
            await interaction.editReply({
                content: `Le joueur \`${name}\` est déjà dans la liste noire !`,
            });
            return;
        }

        const added: boolean = await this.blacklistedPlayers.addPlayer({
            id: Number(id),
            name,
            reason: reason ?? this.defaultReason,
        });

        if (!added) {
            this.logger.debug('An error occur when adding player to blacklist');
            await interaction.editReply({
                content: `Une erreur est survenue lors de l'ajout du joueur en liste noire. Merci de réessayer plus tard ou de contacter <@313006042340524033>`,
            });
            return;
        }

        this.logger.debug('Player {} added to blacklist !', idAndName);
        this.confirmationEmbed
            .setTitle('Ajout de joueur sur liste noire')
            .setDescription(`Le joueur \`${name}\` a été ajouté sur liste noire !`);

        await interaction.editReply({ content: 'Le joueur a bien été ajouté à la liste noire !' });
        await this._channel!.send({
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
        if (!(await this.featureFlippingTable.getFeature('fold_recruitment'))) {
            await interaction.editReply({
                content: "L'observateur n'est pas activé pas l'administrateur <@313006042340524033>",
            });
            return;
        }

        let idAndName: string = interaction.options.get(optionsName[0])?.value as string;
        idAndName = sanitize(idAndName);
        const [id, name] = idAndName.split('#');

        if (!id || !name) {
            await interaction.editReply({
                content:
                    "Merci de sélectionner un joueur dans la liste déroulante. Si vous ne trouvez pas le joueur rechercher cela veut dire qu'il n'est pas présent dans la liste noire",
            });
            return;
        }

        const player: BlacklistedPlayer[] = await this.blacklistedPlayers.getPlayer(Number(id));

        if (player.length === 0) {
            this.logger.debug('Player {} is not blacklisted !', player);
            await interaction.editReply({
                content: `Le joueur \`${idAndName}\` n'est pas sur la liste noire !`,
            });
            return;
        }
        if (player.length > 1) {
            this.logger.warn('Input {} lead to multiple result');
            await interaction.editReply({
                content: "Le champ renseigné conduit à plusieurs résultats. Merci d'affiner la recherche !",
            });
        }

        const removed: boolean = await this.blacklistedPlayers.removePlayer(player[0]);

        if (!removed) {
            this.logger.debug('An error occur during deletion of player {} inside the database', idAndName);
            await interaction.editReply({
                content: `Une erreur est survenue lors de la suppression du joueur. Merci de réessayer plus tard ou de contacter <@313006042340524033>`,
            });
            return;
        }

        this.logger.debug('Player {} removed form blacklist !', idAndName);
        this.confirmationEmbed
            .setTitle('Suppression de joueur sur liste noire')
            .setDescription(`Le joueur \`${name}\` a été supprimé de la liste noire !`);

        await interaction.editReply({ content: 'Le joueur a bien été supprimé de la liste noire !' });
        await this._channel!.send({
            embeds: [this.confirmationEmbed],
        });
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
        if (!(await this.featureFlippingTable.getFeature('fold_recruitment'))) {
            await interaction.respond([]);
            return;
        }

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
                throw new Error(`Invalid interactionType: ${interactionType as string}`);
        }
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
        const idOrName: string = interaction.options.getFocused(true).value;

        await interaction.respond(
            (await this.blacklistedPlayers.findPlayer(idOrName))
                .map((player: BlacklistedPlayer): { name: string; value: string } => ({
                    name: player.name,
                    value: `${player.id}#${player.name}`,
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

        try {
            const searchResult: WargamingSuccessType<PlayerData[]> = await this.wotApi.accountList(focusedOption.value);

            await interaction.respond(
                searchResult.data
                    .map((player: { nickname: string; account_id: number }): { name: string; value: string } => ({
                        name: player.nickname,
                        value: `${player.account_id}#${player.nickname}`,
                    }))
                    .slice(0, 24)
            );
        } catch (e) {
            await interaction.respond([
                {
                    name: 'Une erreur est survenue avec le pseudo renseigné',
                    value: 'ERROR',
                },
            ]);
        }
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
            (await this.watchClans.selectClan(sanitize(idOrName).toUpperCase()))
                .map((clan: Clan): { name: string; value: string } => ({
                    name: clan.name,
                    value: String(clan.id),
                }))
                .slice(0, 24)
        );
    }
}
