import { Clan, FeatureType, PlayerBlacklisted, WatchClan } from '../types/feature.type';
import { Logger } from '../classes/logger';
import { Context } from '../classes/context';
import { CoreFile } from '../classes/core-file';

export class FeatureSingleton extends CoreFile<FeatureType> {
    /**
     * The initial value of the feature configuration.
     */
    private static readonly INITIAL_VALUE: FeatureType = {
        watch_clan: {},
        player_blacklisted: {},
        leaving_player: [],
        potential_clan: [],
    };

    /**
     * Private constructor for the FeatureSingleton class.
     * Initializes the instance by reading the json core file and performs additional setup.
     */
    private constructor() {
        super('./src/module/core', './src/module/core/backup', 'feature.json', FeatureSingleton.INITIAL_VALUE);

        this.logger = new Logger(new Context(FeatureSingleton.name));

        try {
            const json: Buffer = this.readFile();

            if (json && json.length > 0) {
                this.data = JSON.parse(json.toString());
            } else {
                this.data = this._data;
            }
        } catch (e) {
            this.writeData();
        }

        this.backupData();
        this.logger.info('{} instance initialized', FeatureSingleton.name);
    }

    //region SINGLETON
    /**
     * The instance of the class, used for the singleton pattern
     */
    private static _instance: FeatureSingleton | undefined;

    /**
     * Gets the singleton instance of the FeatureSingleton class, initializing it if not already created.
     *
     * @returns {FeatureSingleton} - The singleton instance of the FeatureSingleton class.
     *
     * @example
     * const featureInstance = FeatureSingleton.instance;
     * console.log(featureInstance instanceof FeatureSingleton); // true
     */
    public static get instance(): FeatureSingleton {
        if (!this._instance) {
            this._instance = new FeatureSingleton();
        }

        return this._instance;
    }
    //endregion

    /**
     * Sets the data for the FeatureSingleton instance.
     *
     * @param {FeatureType} data - The new data value to set.
     */
    public set data(data: FeatureType) {
        this._data = this.verifyData(FeatureSingleton.INITIAL_VALUE, data);
        this.writeData();
    }

    //region FOLD-RECRUITMENT
    /**
     * Gets the list of clans to watch.
     */
    public get watchClans(): WatchClan {
        return this._data.watch_clan;
    }

    /**
     * Get the list of blacklisted players.
     */
    public get playerBlacklisted(): PlayerBlacklisted {
        return this._data.player_blacklisted;
    }

    /**
     * Gets the array of leaving player IDs.
     *
     * @returns {number[]} - The array of leaving player IDs.
     */
    public get leavingPlayer(): number[] {
        return this._data.leaving_player;
    }

    /**
     * Gets the array of potential clan names.
     *
     * @returns {string[]} - The array of potential clan names.
     */
    public get potentialClan(): string[] {
        return this._data.potential_clan;
    }

    /**
     * Sets the list of potential clan URLs.
     *
     * @param {string[]} potential_clan - The array of potential clan URLs to set.
     */
    public set potentialClan(potential_clan: string[]) {
        this._data.potential_clan = potential_clan;
        this.writeData();
    }
    //endregion

    //region FOLD-RECRUITMENT METHODS
    /**
     * Adds a clan to the list of watched clans.
     *
     * @param {string} clanId - The unique identifier of the clan.
     * @param {Clan} clan - The clan object to be added, containing at least 'id' and 'name' properties.
     *
     * @returns {boolean} - Returns `true` if the clan was successfully added, and `false` if the clan with the same ID already exists in the list.
     *
     * @example
     * const newClan = { id: '123', name: 'MyClan' };
     * const isAdded = YourClass.addClan(newClan);
     * if (isAdded) {
     *   console.log(`${newClan.name} has been added to the watched clans.`);
     * } else {
     *   console.log(`A clan with ID ${newClan.id} already exists in the watched clans.`);
     * }
     */
    public addClan(clanId: string, clan: Clan): boolean {
        clanId = clanId.trim().replace(/["']/g, '');
        clan.name = clan.name.trim().replace(/["']/g, '').toUpperCase();
        clan.last_activity = new Date().toISOString();
        if (this._data.watch_clan[clanId]) {
            return false;
        }

        this._data.watch_clan[clanId] = clan;
        this.writeData();

        return true;
    }

    /**
     * Removes a clan from the list of watched clans based on its ID or name.
     *
     * @param {string} clanIdOrName - The ID or name of the clan to be removed.
     * @returns {Clan[]} - Returns an array containing the removed clan objects if successfully removed, and an empty array if the clan was not found in the list.
     *
     * @example
     * const clanIdOrName = 'MyClan';
     * const removedClans = FeatureSingleton.removeClan(clanIdOrName);
     * if (removedClans.length > 0) {
     *   console.log(`${clanIdOrName} has been removed from the watched clans.`);
     *   console.log('Removed Clan Details:', removedClans);
     * } else {
     *   console.log(`${clanIdOrName} was not found in the watched clans.`);
     * }
     */
    public removeClan(clanIdOrName: string): Clan | undefined {
        clanIdOrName = clanIdOrName.trim().replace(/["']/g, '').toUpperCase();
        let { id, clan } = this.getClanFromIdOrName(clanIdOrName);

        if (!id || !clan) {
            return undefined;
        }

        delete this._data.watch_clan[id];
        this.writeData();

        return clan;
    }

    /**
     * Get the clan watched from the data with an id or a name
     *
     * @param {string} clanIdOrName - The id or name of the clan to get
     *
     * @return {[string, Clan]} - The clan found in the data, undefined otherwise
     *
     * @example
     * const name = "FOLD_"
     * const [id, clan] = feature.getWatchClanFromIdOrName(name);
     * if (!clan) {
     *     throw new Error(`Clan ${name} not found`);
     * } else {
     *     console.log(`Clan ${clan.name} found`);
     * }
     */
    public getClanFromIdOrName(clanIdOrName: string): { id?: string; clan?: Clan } {
        if (this._data.watch_clan[clanIdOrName]) {
            return { id: clanIdOrName, clan: this._data.watch_clan[clanIdOrName] };
        }

        const filter: [string, Clan] = Object.entries(this._data.watch_clan).filter(
            (clan: [string, Clan]): boolean => clan[1].name === clanIdOrName
        )[0];

        if (!filter) {
            return {};
        }
        return { id: filter[0], clan: filter[1] };
    }

    /**
     * Updates information about a clan in the watch list.
     *
     * @param {string} clanId - The unique identifier of the clan.
     * @param {Clan} clan - The updated clan information.
     *
     * @example
     * const updatedClan: Clan = { name: 'Updated Clan', imageUrl: 'https://example.com/updated_clan_image.jpg' };
     * const id: '123';
     * feature.updateClan(id, updatedClan);
     */
    public updateClan(clanId: string, clan: Clan): void {
        this._data.watch_clan[clanId] = clan;
        this.logger.debug('Clan updated with value : {}', JSON.stringify(clan));
        this.writeData();
    }

    /**
     * Adds a player to the blacklist with the specified reason.
     *
     * @param {string} id - The id of the player to blacklist.
     * @param {string} name - The name of the player to blacklist.
     * @param {string} reason - The reason for blacklisting the player.
     *
     * @returns {boolean} - True if the player was successfully added to the blacklist, false if the player was already blacklisted.
     */
    public addBlacklistedPlayer(id: string, name: string, reason: string): boolean {
        if (this._data.player_blacklisted[id]) {
            return false;
        }

        this._data.player_blacklisted[id] = {
            name: name,
            reason: reason,
        };
        this.writeData();

        return true;
    }

    /**
     * Removes a player from the blacklist.
     *
     * @param {string} id - The id of the player to blacklist.
     *
     * @returns {boolean} - True if the player was successfully removed from the blacklist, false if the player was not found in the blacklist.
     */
    public removeBlacklistedPlayer(id: string): boolean {
        if (!this._data.player_blacklisted[id]) {
            return false;
        }

        delete this._data.player_blacklisted[id];
        this.writeData();

        return true;
    }

    /**
     * Adds a leaving player ID to the data and writes the updated data to the file.
     *
     * @param {number} id - The ID of the leaving player to add.
     */
    public addLeavingPlayer(id: number): void {
        if (this._data.leaving_player.find((value: number): boolean => value === id)) {
            this.logger.debug('Player {} already in list !', String(id));
            return;
        }

        this._data.leaving_player.push(id);
        this.writeData();
        this.logger.debug('Player {} add to the list !', String(id));
    }

    /**
     * Removes a leaving player ID from the data and writes the updated data to the file.
     *
     * @param {number} id - The ID of the leaving player to remove.
     */
    public removeLeavingPlayer(id: number): void {
        const index: number = this._data.leaving_player.findIndex((value: number): boolean => value === id);
        if (index === -1) {
            this.logger.debug('Player {} is not in the list !', String(id));
            return;
        }

        this._data.leaving_player.splice(index, 1);
        this.writeData();
        this.logger.debug('Player {} removed from the list !', String(id));
    }

    /**
     * Adds a potential clan URL to the list if it's not already present.
     *
     * @param {string} url - The URL of the potential clan to add.
     *
     * @throws {Error} Throws an error if the URL is not provided.
     */
    public addPotentialClan(url: string): void {
        if (!url) {
            throw new Error('URL is required.');
        }

        if (this._data.potential_clan.includes(url)) {
            this.logger.debug('Player {} already in list !', url);
            return;
        }

        this._data.potential_clan.push(url);
        this.writeData();
        this.logger.debug('Clan {} add to the list !', url);
    }
    //endregion
}
