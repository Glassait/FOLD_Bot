import { existsSync, mkdir, readFileSync, writeFile as fsWriteFile } from 'fs';
import * as constants from 'node:constants';
import { EmojiEnum } from '../enums/emoji.enum';

/**
 * Writes data into a JSON file.
 *
 * @param {string} path - The path to the JSON file.
 * @param {Object} data - The data to write into the file.
 *
 * @throws {Error} - If the path doesn't refer to a JSON file.
 */
export function writeIntoJson(path: string, data: object): void {
    if (!path.endsWith('.json')) {
        throw new Error("The path doesn't refer to a JSON file");
    }

    writeFile(path, JSON.stringify(data, null, '\t'));
}

export function writeFile(path: string, data: string): void {
    if (!/\.[a-z]+/.test(path)) {
        throw new Error("The path doesn't refer to a file");
    }

    fsWriteFile(path, data, err => {
        if (err) {
            throw new Error(`${EmojiEnum.RED_CROSS} Failed to write into the following ${path.split('/').pop()!} with error:`, err);
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
export function createFolder(path: string): void {
    if (/\.[a-z]+/.test(path)) {
        throw new Error("The path doesn't refer to a folder");
    }

    mkdir(path, constants.R_OK, err => {
        if (err) {
            throw new Error(`${EmojiEnum.RED_CROSS} Failed to create the following folder ${path.split('/').pop()!} with error:`, err);
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
export function folderOrFileExists(path: string): boolean {
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
export function readFile(path: string): Buffer {
    if (!/\.[a-z]+/.test(path)) {
        throw new Error("The path doesn't refer to a file");
    }

    return readFileSync(path);
}
