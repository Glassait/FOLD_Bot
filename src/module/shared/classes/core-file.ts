import { FileUtil } from '../utils/file.util';
import { Logger } from './logger';

export class CoreFile<DType extends object> {
    protected logger: Logger;
    protected _data: DType;

    constructor(
        private readonly path: string,
        private readonly backupPath: string,
        private readonly fileName: string,
        data?: DType
    ) {
        if (data) {
            this._data = data;
        }
    }

    public backupData(): void {
        if (!FileUtil.folderOrFileExists(this.backupPath)) {
            FileUtil.createFolder(this.backupPath);
        }

        FileUtil.writeIntoJson(`${this.backupPath}/${this.fileName}`, this._data);
    }

    protected readFile(): Buffer {
        if (!FileUtil.folderOrFileExists(`${this.path}/${this.fileName}`)) {
            throw new Error(`File ${this.path}/${this.fileName} does not exist`);
        }

        return FileUtil.readFile(`${this.path}/${this.fileName}`);
    }

    protected writeData(): void {
        FileUtil.writeIntoJson(`${this.path}/${this.fileName}`, this._data);
    }

    protected verifyData<T>(initialValue: any, updatedData: T): T {
        const data: any = initialValue;

        Object.keys(initialValue).forEach((key: string): void => {
            data[key as keyof T] = updatedData[key as keyof T] ?? initialValue[key as keyof T];
        });

        return data;
    }
}
