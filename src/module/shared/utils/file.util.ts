import { writeFile } from 'fs';
import { Logger } from '../classes/logger';
import { Context } from '../classes/context';
import { EmojiEnum } from '../enums/emoji.enum';

export class FileUtil {
    private static readonly logger: Logger = new Logger(new Context(FileUtil.name));

    /**
     * Static method to write into file.
     * To write in the file we firstly stringify the object with {@link JSON#stringify} with `\t` at third parameter
     * @private
     */
    public static writeIntoJson(path: string, data: Object): void {
        if (!path.endsWith('.json')) {
            this.logger.error("The path doesn't refer to a json file");
        }
        writeFile(path, JSON.stringify(data, null, '\t'), err => {
            if (err) {
                this.logger.warn(
                    `${EmojiEnum.LOOP}${EmojiEnum.RED_CROSS} Failed to sync the inventory file with error: {}`,
                    err as unknown as string
                );
            } else {
                this.logger.debug(`${path.split('/')[path.split('/').length - 1]} successfully updated`);
            }
        });
    }
}
