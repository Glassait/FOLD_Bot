import { readFileSync, writeFile } from 'fs';
import { DiscordId, FeatureType, Reply } from '../types/feature.type';
import { Context } from '../utils/context.class';
import { LoggerSingleton } from './logger.singleton';

export class FeatureSingleton extends Context {
    public readonly path: string = './src/feature.json';

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

    private static _instance: FeatureSingleton | undefined;

    public static get instance(): FeatureSingleton {
        if (!this._instance) {
            this._instance = new FeatureSingleton();
        }
        return this._instance;
    }

    private readonly _data: FeatureType;

    get data(): FeatureType {
        return this._data;
    }

    set data(value: FeatureType) {
        this._data.version = value.version ?? 2;
        this._data.auto_disconnect = value.auto_disconnect ?? '';
        this._data.auto_reply = value.auto_reply ?? [];

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

    public getArrayFromReplyTo(replyTo: DiscordId): Reply[] {
        return this._data.auto_reply.filter((value: Reply): boolean => value.replyTo === replyTo);
    }

    public hasAutoReplyTo(activateFor: DiscordId, replyTo: DiscordId): boolean {
        return this._data.auto_reply.some((value: Reply) => value.activateFor === activateFor && value.replyTo === replyTo);
    }

    private syncFeatureFile(): void {
        try {
            const json: Buffer = readFileSync(this.path);

            if (json.toString()) {
                this.data = JSON.parse(json.toString());
            }
        } catch (e) {
            this.updateFile();
        }
    }

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
