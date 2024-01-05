import { readFileSync } from 'fs';
import { Clan, DiscordId, FeatureType, Reply } from '../types/feature.type';
import { Logger } from '../classes/logger';
import { Context } from '../classes/context';
import { FileUtil } from '../utils/file.util';

export class FeatureSingleton {
    //region PRIVATE READONLY FIELDS
    /**
     * The path to the feature configuration file.
     */
    private readonly path: string = './src/feature.json';
    /**
     * @instance of the logger
     */
    private readonly logger: Logger = new Logger(new Context(FeatureSingleton.name));
    /**
     * The initial value of the feature configuration.
     */
    private readonly INITIAL_VALUE: FeatureType = {
        auto_disconnect: '',
        auto_reply: [],
        watch_clan: [],
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

    /**
     * The instance of the class, used for the singleton pattern
     * @private
     */
    private static _instance: FeatureSingleton | undefined;

    /**
     * Getter for {@link _instance}
     */
    public static get instance(): FeatureSingleton {
        if (!this._instance) {
            this._instance = new FeatureSingleton();
            this._instance.logger.trace('Feature instance initialized');
        }
        return this._instance;
    }

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

    /**
     * Sets the auto-disconnect target.
     * @param targetId The ID of the user to auto-disconnect.
     */
    public set autoDisconnect(targetId: DiscordId) {
        this._data.auto_disconnect = targetId;
        FileUtil.writeIntoJson(this.path, this._data);
    }

    /**
     * Gets the list of clans to watch.
     */
    public get clans(): Clan[] {
        return this._data.watch_clan;
    }

    /**
     * Adds a clan to the list of clans to watch.
     * @param clan The clan to add.
     */
    public addClan(clan: Clan): boolean {
        clan.id = clan.id.trim().replace(/["']/, '');
        clan.name = clan.name.trim().replace(/["']/, '');
        if (this._data.watch_clan.filter((value: Clan) => (value.id = clan.id))) {
            return false;
        }

        this._data.watch_clan.push(clan);
        FileUtil.writeIntoJson(this.path, this._data);

        return true;
    }

    /**
     * Removes a clan from the list of clans to watch.
     * @param clanID The clan to remove.
     */
    public removeClan(clanID: string): void {
        this._data.watch_clan = this._data.watch_clan.filter((c: Clan): boolean => c.id !== clanID);
        FileUtil.writeIntoJson(this.path, this._data);
    }

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
            this.logger.warning(`No auto-reply for ${activateFor} to reply to ${replyTo}`);
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
}
