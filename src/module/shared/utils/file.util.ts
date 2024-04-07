import { constants, existsSync, mkdir, readFileSync, writeFile } from 'fs';
import { Logger } from '../classes/logger';
import { Context } from '../classes/context';
import { EmojiEnum } from '../enums/emoji.enum';

/**
 * Utility class for file-related operations.
 */
export class FileUtil {
    private static readonly logger: Logger = new Logger(new Context(FileUtil.name));

    /**
     * Writes data into a JSON file.
     *
     * @param {string} path - The path to the JSON file.
     * @param {Object} data - The data to write into the file.
     *
     * @throws {Error} If the path doesn't refer to a JSON file.
     */
    public static writeIntoJson(path: string, data: Object): void {
        if (!path.endsWith('.json')) {
            throw new Error("The path doesn't refer to a JSON file");
        }

        const fileName: string = path.split('/').pop() as string;

        writeFile(path, JSON.stringify(data, null, '\t'), err => {
            if (err) {
                this.logger.warn(
                    `${EmojiEnum.LOOP}${EmojiEnum.RED_CROSS} Failed to sync the ${fileName} file with error: {}`,
                    err as unknown as string
                );
            } else {
                this.logger.debug(`{} successfully updated`, fileName);
            }
        });
    }

    /**
     * Creates a folder at the specified path.
     *
     * @param {string} path - The path to create the folder.
     *
     * @throws {Error} If the path refers to a file instead of a folder.
     */
    public static createFolder(path: string): void {
        if (/\.[a-z]+/.test(path)) {
            throw new Error("The path doesn't refer to a folder");
        }

        const folderName: string = path.split('/').pop() as string;

        mkdir(path, constants.R_OK, err => {
            if (err) {
                throw new Error(`${EmojiEnum.RED_CROSS} Failed to create the following folder ${folderName} with error:`, err);
            } else {
                this.logger.debug(`${folderName} successfully created`);
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
     * @throws {Error} If the path refers to a folder instead of a file.
     *
     * @template Buffer - Template to allow types in JsDoc
     */
    public static readFile(path: string): Buffer {
        if (!/\.[a-z]+/.test(path)) {
            throw new Error("The path doesn't refer to a folder");
        }

        return readFileSync(path);
    }
}
