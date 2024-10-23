import { TableAbstract } from 'abstracts/table.abstract';
import { InsertIntoBuilder } from 'builders/query/insert-into.builder';
import { LoggerInjector } from 'decorators/injector/logger-injector.decorator';
import { SingletonClass } from 'decorators/injector/singleton-injector.decorator';
import { escape } from "utils/string.util";

@LoggerInjector
@SingletonClass('FoldDatabase')
export class WotNewsTable extends TableAbstract {
    constructor() {
        super('wot_news');
    }

    /**
     * Add a Wot News in the database
     *
     * @param title The title of the news
     * @param url The url of the news
     * @param imageUrl The url of the image of the news
     * @param tags All tags of the news
     */
    public async addNews(title: string, url: string,  imageUrl: string, tags: string[]): Promise<boolean> {
        return await this.insert(new InsertIntoBuilder(this).columns('title', 'url', 'image_url', 'tags').values(escape(title), url, imageUrl, escape(tags.join(','))));
    }
}
