import { TableAbstract } from '../abstracts/table.abstract';
import { SelectBuilder } from '../builders/query.builder';
import { LoggerInjector } from '../decorators/injector.decorator';

type WotApi = 'image_url' | 'player_url' | 'player_personal_data' | 'trivia';

@LoggerInjector
export class WotApiTable extends TableAbstract {
    constructor() {
        super('wot_api');
    }

    public async getUrl(name: WotApi): Promise<string> {
        return (
            (await this.select(
                new SelectBuilder(this.tableName)
                    .columns('url')
                    .where([`name LIKE '${name}'`])
                    .compute()
            )) as any
        )[0].url;
    }
}
