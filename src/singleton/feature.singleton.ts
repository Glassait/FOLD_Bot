import { writeFile } from 'fs';
import { DiscordId, FeatureType, Reply } from '../types/feature.type';
import { Context } from '../utils/context.class';
import { LoggerSingleton } from './logger.singleton';

export class FeatureSingleton extends Context {
    public static readonly path: string = './src/feature.json';

    private readonly logger: LoggerSingleton = LoggerSingleton.instance;

    constructor() {
        super(FeatureSingleton);
        this._data = {
            version: 2,
            auto_disconnect: '',
            auto_reply: [],
        };
    }

    private static _instance: FeatureSingleton | undefined;

    public static get instance(): FeatureSingleton {
        if (!this._instance) {
            this._instance = new FeatureSingleton();
        }
        return this._instance;
    }

    private _data: FeatureType;

    get data(): FeatureType {
        return this._data;
    }

    set data(value: FeatureType) {
        if (!value.version || value.version != this._data.version) {
            this._data.auto_disconnect = value.auto_disconnect ? value.auto_disconnect : '';
            this._data.auto_reply = value.auto_reply ? value.auto_reply : [];
        } else {
            this._data = value;
        }

        this.updateFile();
    }

    set autoDisconnect(targetId: DiscordId) {
        this._data.auto_disconnect = targetId;
        this.updateFile();
    }

    public pushAutoReply(item: Reply): void {
        this._data.auto_reply.push(item);
        this.updateFile();
    }

    public deleteAutoReply(activateFor: DiscordId, replyTo: DiscordId): void {
        const object: Reply | undefined = this._data.auto_reply.find(
            (value: Reply) => value.activateFor === activateFor && value.replyTo === replyTo
        );
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

    public getArrayFromReplyTo(replyTo: DiscordId): Reply[] {
        return this._data.auto_reply.filter((value: Reply): boolean => value.replyTo === replyTo);
    }

    public hasAutoReplyTo(activateFor: DiscordId, replyTo: DiscordId): boolean {
        return this._data.auto_reply.some(
            (value: Reply) => value.activateFor === activateFor && value.replyTo === replyTo
        );
    }

    private updateFile(): void {
        writeFile(FeatureSingleton.path, JSON.stringify(this._data, null, '\t'), err => {
            if (err) {
                this.logger.warning(
                    this.context,
                    `🔄❌ Failed to sync the feature file with error: ${err}`
                );
            }
        });
    }
}