import type { NewsWebsite } from 'tables/complexe-table/news-websites/models/news-websites.type';
import { NewsScrapper } from './news-scrapper.model';
import { SimpleXMLParser, XmlElement } from 'utils/parser';
import { transformToCode, transformUnicodeToLetter } from 'utils/string.util';
import { TimeEnum } from 'enums/time.enum';
import { sleep } from 'utils/env.util';
import { Table } from 'decorators/injector/table-injector.decorator';
import { WotNewsTable } from 'tables/complexe-table/wot-news/wot-news.table';

/**
 * Class responsible for scraping news from Wot Express website.
 */
export class WotNews extends NewsScrapper<XmlElement> {
    @Table('WotNews') private readonly wotNewsTable: WotNewsTable;

    /**
     * The default index used when the url is not found
     */
    private readonly defaultIndex: number = 20;

    /**
     * Scrapes news from the Wot Express website.
     *
     * @param {NewsWebsite} newsWebsite - The website to scrap and get the news.
     */
    public async scrap(newsWebsite: NewsWebsite): Promise<void> {
        const children: XmlElement[] | undefined = this.$.children;
        if (!children) {
            throw new Error(transformToCode('Failed to scrap {}, cause xml parsing failed, retrying later', newsWebsite.name));
        }

        const items: XmlElement[] = children.filter(({ tag }): boolean => tag === 'item');
        let index: number = items.findIndex(
            ({ children }) => children?.filter(({ tag }) => tag === 'link')[0].text === newsWebsite.last_url
        );

        if (index === -1) {
            index = this.defaultIndex;
        }

        if (!newsWebsite.last_url) {
            await this.wotNews(items[0], newsWebsite);
        } else if (index > 0) {
            for (let i = index - 1; i >= 0; i--) {
                await this.wotNews(items[i], newsWebsite);
                await sleep(TimeEnum.MINUTE);
            }
        }
    }

    /**
     * Scrapes news from a specific page of Wot Express website.
     *
     * @param items - The item on the page.
     * @param newsWebsite - The website to scrap and get the news.
     */
    private async wotNews(items: XmlElement, newsWebsite: NewsWebsite): Promise<void> {
        const description: XmlElement = new SimpleXMLParser(items.children![2].text!).parse();
        const title: string = transformUnicodeToLetter(items.children![0].text!);
        const image: string = items.children![6].attributes!.url;
        const url: string = items.children![1].text!;

        const tags: string[] = (await this.sendNews(
            url,
            title,
            transformUnicodeToLetter(description.text!),
            newsWebsite,
            image
        ))!;

        await this.wotNewsTable.addNews(title, url, image, tags)
    }
}
