import { constants, existsSync, mkdir, readFileSync, writeFile } from 'fs';
import { EmojiEnum } from '../enums/emoji.enum';

/**
 * Utility class for file-related operations.
 */
export class FileUtil {
    /**
     * Writes data into a JSON file.
     *
     * @param {string} path - The path to the JSON file.
     * @param {Object} data - The data to write into the file.
     *
     * @throws {Error} - If the path doesn't refer to a JSON file.
     */
    public static writeIntoJson(path: string, data: Object): void {
        if (!path.endsWith('.json')) {
            throw new Error("The path doesn't refer to a JSON file");
        }

        this.writeFile(path, JSON.stringify(data, null, '\t'));
    }

    public static writeFile(path: string, data: string): void {
        if (!/\.[a-z]+/.test(path)) {
            throw new Error("The path doesn't refer to a file");
        }

        writeFile(path, data, err => {
            if (err) {
                throw new Error(
                    `${EmojiEnum.RED_CROSS} Failed to write into the following ${path.split('/').pop() as string} with error:`,
                    err
                );
            }
        });
    }

    /**
     * Creates a folder at the specified path.
     *
     * @param {string} path - The path to create the folder.
     *
     * @throws {Error} - If the path refers to a file instead of a folder.
     */
    public static createFolder(path: string): void {
        if (/\.[a-z]+/.test(path)) {
            throw new Error("The path doesn't refer to a folder");
        }

        mkdir(path, constants.R_OK, err => {
            if (err) {
                throw new Error(
                    `${EmojiEnum.RED_CROSS} Failed to create the following folder ${path.split('/').pop() as string} with error:`,
                    err
                );
            }
        });
    }

    /**
     * Checks if a folder or file exists at the specified path.
     *
     * @param {string} path - The path to check.
     *
     * @returns {boolean} True if the folder or file exists, false otherwise.
     */
    public static folderOrFileExists(path: string): boolean {
        return existsSync(path);
    }

    /**
     * Reads and returns the content of a file as a Buffer.
     *
     * @param {string} path - The path to the file.
     *
     * @returns {Buffer} The content of the file as a Buffer.
     *
     * @throws {Error} - If the path refers to a folder instead of a file.
     *
     * @template Buffer - Template to allow types in JsDoc
     */
    public static readFile(path: string): Buffer {
        if (!/\.[a-z]+/.test(path)) {
            throw new Error("The path doesn't refer to a file");
        }

        return readFileSync(path);
    }
}
