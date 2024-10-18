import { TimeEnum } from 'enums/time.enum';
import type { NewsWebsite } from 'tables/complexe-table/news-websites/models/news-websites.type';
import { sleep } from 'utils/env.util';
import { NewsScrapper } from './news-scrapper.model';
import { type CheerioAPI, Element, SelectorType } from 'cheerio';

/**
 * Class responsible for scraping news from Wot Express website.
 */
export class WotExpress extends NewsScrapper<CheerioAPI> {
    /**
     * The default index used when the url is not found
     */
    private readonly defaultIndex: number = 12;

    /**
     * Scrapes news from the Wot Express website.
     *
     * @param {NewsWebsite} newsWebsite - The website to scrap and get the news.
     */
    public async scrap(newsWebsite: NewsWebsite): Promise<void> {
        const links: Element[] = this.$(newsWebsite.selector as SelectorType).get();
        let index: number = links.findIndex((link: Element): boolean => link.attribs.href === newsWebsite.last_url);

        if (index === -1) {
            index = this.defaultIndex;
        }

        if (!newsWebsite.last_url) {
            await this.wotExpress(links, 1, newsWebsite);
        } else if (index > 0) {
            for (let i = index - 1; i >= 1; i--) {
                await this.wotExpress(links, i, newsWebsite);
                await sleep(TimeEnum.MINUTE);
            }
        }
    }

    /**
     * Scrapes news from a specific page of Wot Express website.
     *
     * @param {Element[]} links - The list of links on the page.
     * @param {number} index - The index of the link to scrape.
     * @param {NewsWebsite} newsWebsite - The website to scrap and get the news.
     */
    private async wotExpress(links: Element[], index: number, newsWebsite: NewsWebsite): Promise<void> {
        const isEu: boolean = (links[index].children[2] as Element).attribs.class.includes('eu');

        await this.sendNews(
            links[index].attribs.href,
            `${newsWebsite.name} : ${isEu ? 'EU news' : 'RU news'}`,
            `Nouvelle rumeur venant de ${newsWebsite.name}`,
            newsWebsite,
            (links[index].children[0] as Element).attribs.style.split('url(/')[1].split(')')[0]
        );
    }
}
