import { LoggerInjector } from '../../decorators/injector/logger-injector.decorator';
import { ApiBase } from '../api.base';
import type { WargamingNewsfeed } from './models/wargaming.type';

@LoggerInjector
export class WargamingApi extends ApiBase {
    constructor() {
        super('https://eu.wargaming.net');
    }

    public async clansNewsfeed(clanId: number, date: string = new Date().toISOString().slice(0, 19)): Promise<WargamingNewsfeed> {
        const url = this.createUrl(`clans/wot/${clanId}/newsfeed/api/events/?offset=3600`);
        this.addSearchParam(url, 'date_until', date);
        return await this.getData(url);
    }
}
