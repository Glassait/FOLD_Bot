import { writeFile as fsWriteFile } from 'fs';
import { EmojiEnum } from 'enums/emoji.enum';

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
