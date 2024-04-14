import { basename } from 'node:path';
import { CoreFile } from '../classes/core-file';
import { Logger } from '../classes/logger';
import type { FeatureType } from '../types/feature.type';

export class FeatureSingleton extends CoreFile<FeatureType> {
    /**
     * The initial value of the feature configuration.
     */
    private static readonly INITIAL_VALUE: FeatureType = {
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

        this.logger = new Logger(basename(__filename));

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
     * @throws {Error} - Throws an error if the URL is not provided.
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
