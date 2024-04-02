import { readFileSync } from 'fs';
import { Clan, DiscordId, FeatureType, Reply } from '../types/feature.type';
import { Logger } from '../classes/logger';
import { Context } from '../classes/context';
import { FileUtil } from '../utils/file.util';

export class FeatureSingleton {
    //region INJECTOR
    private readonly logger: Logger = new Logger(new Context(FeatureSingleton.name));
    //endregion

    //region PRIVATE READONLY FIELDS
    /**
     * The path to the feature configuration file.
     */
    private readonly path: string = './src/module/core/feature.json';
    /**
     * The backup  path to the feature configuration file.
     */
    private readonly backupPath: string = './src/module/core/backup/feature.json';
    /**
     * The initial value of the feature configuration.
     */
    private readonly INITIAL_VALUE: FeatureType = {
        auto_disconnect: '',
        auto_reply: [],
        watch_clan: {},
    };
    //endregion

    private constructor() {
        try {
            const json: Buffer = readFileSync(this.path);

            if (json.toString() && json.toString().length > 0) {
                this.data = JSON.parse(json.toString());
            } else {
                this.data = this._data;
            }
        } catch (e) {
            FileUtil.writeIntoJson(this.path, this._data);
        }
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
     * ```typescript
     * const featureInstance = FeatureSingleton.instance;
     * console.log(featureInstance instanceof FeatureSingleton); // true
     * ```
     */
    public static get instance(): FeatureSingleton {
        if (!this._instance) {
            this._instance = new FeatureSingleton();
            this._instance.logger.info('{} instance initialized', 'Feature');
        }
        return this._instance;
    }
    //endregion

    //region DATA
    /**
     * The current feature configuration.
     */
    private _data: FeatureType = this.INITIAL_VALUE;

    /**
     * Gets the current feature configuration.
     */
    public get data(): FeatureType {
        return this._data;
    }

    /**
     * Sets the feature configuration.
     * @param value The new feature configuration.
     */
    public set data(value: FeatureType) {
        const data: any = this.INITIAL_VALUE;
        Object.keys(this.INITIAL_VALUE).forEach((key: string): void => {
            data[key as keyof FeatureType] = value[key as keyof FeatureType] ?? this.INITIAL_VALUE[key as keyof FeatureType];
        });
        this._data = data;
        FileUtil.writeIntoJson(this.path, this._data);
    }
    //endregion

    //region AUTO-DISCONNECT
    /**
     * Sets the auto-disconnect target.
     * @param targetId The ID of the user to auto-disconnect.
     */
    public set autoDisconnect(targetId: DiscordId) {
        this._data.auto_disconnect = targetId;
        FileUtil.writeIntoJson(this.path, this._data);
    }
    //endregion

    //region FOLD-RECRUITMENT
    /**
     * Gets the list of clans to watch.
     */
    public get watch_clans(): { [p: string]: Clan } {
        return this._data.watch_clan;
    }
    //endregion

    /**
     * Backs up the current data of the feature singleton by writing it into a JSON file.
     */
    public backupData(): void {
        this.logger.info('Backing up {}', FeatureSingleton.name);
        FileUtil.writeIntoJson(this.backupPath, this._data);
    }

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
        FileUtil.writeIntoJson(this.path, this._data);

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
        let { id, clan } = this.getWatchClanFromIdOrName(clanIdOrName);

        if (!id || !clan) {
            return undefined;
        }

        delete this._data.watch_clan[id];
        FileUtil.writeIntoJson(this.path, this._data);

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
    public getWatchClanFromIdOrName(clanIdOrName: string): { id?: string; clan?: Clan } {
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

        FileUtil.writeIntoJson(this.path, this._data);
    }
    //endregion

    //region AUTO-REPLY
    /**
     * Adds an auto-reply rule.
     * @param item The auto-reply rule to add.
     */
    public addAutoReply(item: Reply): void {
        this._data.auto_reply.push(item);
        FileUtil.writeIntoJson(this.path, this._data);
    }

    /**
     * Deletes an auto-reply rule.
     * @param activateFor The ID of the user that triggers the auto-reply.
     * @param replyTo The ID of the user that the auto-reply is sent to.
     */
    public deleteAutoReply(activateFor: DiscordId, replyTo: DiscordId): void {
        const object: Reply | undefined = this._data.auto_reply.find(
            (value: Reply) => value.activateFor === activateFor && value.replyTo === replyTo
        );
        if (!object) {
            this.logger.warn('No auto-reply for {} to reply to {}', activateFor, replyTo);
            return;
        }

        const index: number = this._data.auto_reply.indexOf(object);

        this._data.auto_reply.splice(index, 1);
        FileUtil.writeIntoJson(this.path, this._data);
    }

    /**
     * Gets the auto-replies for a specific user.
     * @param replyTo The ID of the user.
     */
    public getArrayFromReplyTo(replyTo: DiscordId): Reply[] {
        return this._data.auto_reply.filter((value: Reply): boolean => value.replyTo === replyTo);
    }

    /**
     * Checks if an auto-reply rule exists for a specific user.
     * @param activateFor The ID of the user that triggers the auto-reply.
     * @param replyTo The ID of the user that the auto-reply is sent to.
     */
    public hasAutoReplyTo(activateFor: DiscordId, replyTo: DiscordId): boolean {
        return this._data.auto_reply.some((value: Reply) => value.activateFor === activateFor && value.replyTo === replyTo);
    }
    //endregion
}
