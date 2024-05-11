import { TimeEnum } from '../../../../shared/enums/time.enum';
import type { NewsWebsite } from '../../../../shared/types/news_website.type';
import { EnvUtil } from '../../../../shared/utils/env.util';
import { NewsScrapper } from './news-scrapper.model';

/**
 * Class responsible for scraping news from Wot Express website.
 */
export class WotExpress extends NewsScrapper {
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
        const links: any[] = this.$(newsWebsite.selector).get();
        let index: number = links.findIndex((link: any): boolean => link.attribs.href == newsWebsite.last_url);

        if (index === -1) {
            index = this.defaultIndex;
        }

        if (!newsWebsite.last_url) {
            await this.wotExpress(links, 1, newsWebsite);
        } else if (index > 0) {
            for (let i = index - 1; i >= 1; i--) {
                await this.wotExpress(links, i, newsWebsite);
                await EnvUtil.sleep(TimeEnum.MINUTE);
            }
        }
    }

    /**
     * Scrapes news from a specific page of Wot Express website.
     *
     * @param {any[]} links - The list of links on the page.
     * @param {number} index - The index of the link to scrape.
     * @param {NewsWebsite} newsWebsite - The website to scrap and get the news.
     */
    private async wotExpress(links: any[], index: number, newsWebsite: NewsWebsite): Promise<void> {
        const isEu = links[index].children[2]?.attribs.class?.includes('eu');

        await this.sendNews(
            links[index].attribs.href,
            `${newsWebsite.name} : ${isEu ? 'EU news' : 'RU news'}`,
            `Nouvelle rumeur venant de ${newsWebsite.name}`,
            newsWebsite,
            links[index].children[0].attribs.style.split('url(/')[1].split(')')[0]
        );
    }
}
