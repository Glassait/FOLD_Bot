import { LoggerInjector } from '../../decorators/injector/logger-injector.decorator';
import { transformToCode } from '../../utils/string.util';
import { ApiBase } from '../api.base';
import type { TomatoError, TomatoOverall, TomatoSuccess } from './models/tomato-api.type';

@LoggerInjector
export class TomatoApi extends ApiBase {
    constructor() {
        super('https://api.tomato.gg/');
    }

    /**
     * Retrieves the overall statistics for a player.
     *
     * @param {number} playerId - The unique identifier of the player.
     *
     * @returns {Promise<TomatoSuccess<TomatoOverall>>} - A promise that resolves to an object containing the player's overall statistics.
     *
     * @throws {Error} - An error if the API call fails.
     */
    public async playerOverall(playerId: number): Promise<TomatoSuccess<TomatoOverall>> {
        const url: URL = this.createUrl(`/dev/api-v2/player/overall/eu/${playerId}`);
        const data: TomatoError | TomatoSuccess<TomatoOverall> = await this.getData(url);

        if (data.meta.status === 'error') {
            throw new Error(transformToCode('Failed to call Tomato api with error {}', data.meta.message));
        }

        return data as TomatoSuccess<TomatoOverall>;
    }
}
