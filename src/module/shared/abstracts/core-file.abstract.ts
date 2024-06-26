import { createFolder, folderOrFileExists, readFile, writeIntoJson } from '../utils/file.util';
import type { Logger } from '../utils/logger';

/**
 * Represents a core file handler.
 *
 * * I keep this class because I think I code it well
 *
 * @template DType - The type of data stored in the file.
 *
 * @deprecated
 * @ignore
 */
export class CoreFileAbstract<DType extends object> {
    /**
     * Logger instance, initialized in the child constructor
     */
    protected logger: Logger;

    /**
     * The data stored in the file
     */
    protected _data: DType;

    /**
     * Creates an instance of CoreFileAbstract.
     *
     * @param {string} path - The path where the file is located.
     * @param {string} backupPath - The path where backup files are stored.
     * @param {string} fileName - The name of the file.
     * @param {DType} [data] - The initial data to populate the file with.
     *
     * @constructor
     */
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

    /**
     * Creates a backup of the data in the file.
     */
    public backupData(): void {
        if (!folderOrFileExists(this.backupPath)) {
            createFolder(this.backupPath);
        }

        writeIntoJson(`${this.backupPath}/${this.fileName}`, this._data);
    }

    /**
     * Reads data from the file.
     *
     * @returns {Buffer} - The data read from the file as a buffer.
     *
     * @throws {Error} - If the file does not exist.
     *
     * @template Buffer - Template to allow Buffer type in comment
     */
    protected readFile(): Buffer {
        if (!folderOrFileExists(`${this.path}/${this.fileName}`)) {
            throw new Error(`File ${this.path}/${this.fileName} does not exist`);
        }

        return readFile(`${this.path}/${this.fileName}`);
    }

    /**
     * Writes data to the file.
     */
    protected writeData(): void {
        writeIntoJson(`${this.path}/${this.fileName}`, this._data);
    }

    /**
     * Verifies and updates the data with the provided updated data.
     *
     * @param {any} initialValue - The initial value of the data.
     * @param {T} updatedData - The updated data.
     *
     * @returns {T} - The verified and updated data.
     *
     * @template T - The type of data being verified and updated.
     */
    protected verifyData<T extends Record<string, unknown>>(initialValue: T, updatedData: T): T {
        const data = { ...initialValue };

        Object.keys(initialValue).forEach((key: string): void => {
            data[key as keyof T] = updatedData[key as keyof T] ?? initialValue[key as keyof T];
        });

        return data;
    }
}
