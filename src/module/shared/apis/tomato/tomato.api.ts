import { StringUtil } from '../../utils/string.util';
import { ApiBase } from '../api.base';
import type { TomatoError, TomatoOverall, TomatoSuccess } from './models/tomato-api.type';

export class TomatoApi extends ApiBase {
    constructor() {
        super('https://api.tomato.gg/');
    }

    public async playerOverall(playerId: number): Promise<TomatoSuccess<TomatoOverall>> {
        const url: URL = this.createUrl(`/dev/api-v2/player/overall/eu/${playerId}`);
        const data: TomatoError | TomatoSuccess<TomatoOverall> = await this.getData(url);

        if (data.meta.status === 'error') {
            throw new Error(StringUtil.transformToCode('Failed to call Tomato api with error {}', data.meta.message));
        }

        return data as TomatoSuccess<TomatoOverall>;
    }
}
