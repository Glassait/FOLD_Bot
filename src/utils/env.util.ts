import { MockEnum } from '../enums/mock.enum';

export class EnvUtil {
    public static isDev(): boolean {
        return process.argv[3] === MockEnum.DEV;
    }
}
