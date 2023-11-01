import { writeFile } from 'fs';
import { FeatureType } from '../types/feature.type';

export class FeatureSingleton {
    public static path: string = './src/feature.json';

    constructor() {
        this._data = {
            auto_disconnect: '',
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
        this._data = value;
        this.updateFile();
    }

    set autoDisconnect(targetId: string) {
        this._data.auto_disconnect = targetId;
        this.updateFile();
    }

    private updateFile(): void {
        writeFile(FeatureSingleton.path, JSON.stringify(this._data), err => {
            if (err) {
                console.error(`🔄❌ Failed to sync the feature file with error: ${err}`);
            }
        });
    }
}
