import { readFileSync, writeFile } from 'fs';
import { DiscordId, FeatureType, Reply } from '../types/feature.type';
import { Context } from '../utils/context.class';
import { LoggerSingleton } from './logger.singleton';

/**
 * Class used to manage the feature.json file
 * This class implement the Singleton pattern
 */
export class FeatureSingleton extends Context {
    /**
     * The path to the feature.json file
     */
    public readonly path: string = './src/feature.json';

    /**
     * The instance of the logger
     * @private
     */
    private readonly logger: LoggerSingleton = LoggerSingleton.instance;

    constructor() {
        super(FeatureSingleton);
        this._data = {
            version: 2,
            auto_disconnect: '',
            auto_reply: [],
        };
        this.syncFeatureFile();
        this.logger.trace(this, 'Feature instance initialized');
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
        }
        return this._instance;
    }

    /**
     * The data of the feature.json file
     * @private
     */
    private readonly _data: FeatureType;

    /**
     * Getter for {@link _data}
     */
    public get data(): FeatureType {
        return this._data;
    }

    /**
     * Setter for {@link _data}, each time used update the feature.json file
     * @param value The new data
     */
    public set data(value: FeatureType) {
        this._data.version = value.version ?? 2;
        this._data.auto_disconnect = value.auto_disconnect ?? '';
        this._data.auto_reply = value.auto_reply ?? [];

        this.updateFile();
    }

    /**
     * Methode to set the `auto_disconnect` field in the data.
     * Update the feature.json file
     * @param targetId The id of the target
     */
    public set autoDisconnect(targetId: DiscordId) {
        this._data.auto_disconnect = targetId;
        this.updateFile();
    }

    /**
     * Add the new auto-reply register to the array.
     * Update the feature.json file
     * @param item The new auto-reply
     */
    public pushAutoReply(item: Reply): void {
        this._data.auto_reply.push(item);
        this.updateFile();
    }

    /**
     * Delete an auto-reply form the data
     * Update the feature.json file
     * @param activateFor The user id
     * @param replyTo The id of the auto-reply target
     */
    public deleteAutoReply(activateFor: DiscordId, replyTo: DiscordId): void {
        const object: Reply | undefined = this._data.auto_reply.find((value: Reply) => value.activateFor === activateFor && value.replyTo === replyTo);
        if (!object) {
            return;
        }

        const index: number = this._data.auto_reply.indexOf(object);

        if (index < 0) {
            return;
        }

        this._data.auto_reply.splice(index, 1);
        this.updateFile();
    }

    /**
     * Get all the auto-reply who the user is mention
     * @param replyTo The id of the user
     */
    public getArrayFromReplyTo(replyTo: DiscordId): Reply[] {
        return this._data.auto_reply.filter((value: Reply): boolean => value.replyTo === replyTo);
    }

    /**
     * Check if the user already have an auto-reply for the target
     * @param activateFor The id if the user
     * @param replyTo The id of the target
     */
    public hasAutoReplyTo(activateFor: DiscordId, replyTo: DiscordId): boolean {
        return this._data.auto_reply.some((value: Reply) => value.activateFor === activateFor && value.replyTo === replyTo);
    }

    /**
     * Read the feature.json file and set the data
     * @private
     */
    private syncFeatureFile(): void {
        try {
            const json: Buffer = readFileSync(this.path);

            if (json.toString() && json.toString().length > 0) {
                this.data = JSON.parse(json.toString());
            } else {
                this.data = this._data;
            }
        } catch (e) {
            this.updateFile();
        }
    }

    /**
     * Update the feature.json file with the new data
     * @private
     */
    private updateFile(): void {
        writeFile(this.path, JSON.stringify(this._data, null, '\t'), err => {
            if (err) {
                this.logger.warning(this, `🔄❌ Failed to sync the feature file with error: ${err}`);
            } else {
                this.logger.trace(this, 'Feature.json successfully updated');
            }
        });
    }
}