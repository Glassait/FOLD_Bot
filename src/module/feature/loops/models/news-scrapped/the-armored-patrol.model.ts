import { TimeEnum } from '../../../../shared/enums/time.enum';
import type { NewsWebsite } from '../../../../shared/tables/complexe-table/news-websites/models/news-websites.type';
import { EnvUtil } from '../../../../shared/utils/env.util';
import { NewsScrapper } from './news-scrapper.model';
import { Element, SelectorType } from 'cheerio';

/**
 * Class responsible for scraping news from The Armored Patrol website.
 */
export class TheArmoredPatrol extends NewsScrapper {
    /**
     * Scrapes news from The Armored Patrol website.
     *
     * @param {NewsWebsite} webSiteState - The website to scrap and get the news.
     */
    public async scrap(webSiteState: NewsWebsite): Promise<void> {
        const containers: Element[] = this.$(webSiteState.selector as SelectorType).get();
        const index: number = containers.findIndex(
            (container: Element): boolean =>
                (((container.children[1] as Element).children[1] as Element).children[0] as Element).attribs.href == webSiteState.last_url
        );

        if (!webSiteState.last_url) {
            await this.armoredPatrol(containers, 0, webSiteState);
        } else if (index > 0) {
            for (let i = index - 1; i >= 0; i--) {
                await this.armoredPatrol(containers, i, webSiteState);
                await EnvUtil.sleep(TimeEnum.MINUTE);
            }
        }
    }

    /**
     * Scrapes news from a specific page of The Armored Patrol website.
     *
     * @param {Element[]} containers - The list of containers containing news articles.
     * @param {number} index - The index of the container to scrape.
     * @param {NewsWebsite} webSiteState - The website to scrap and get the news.
     */
    private async armoredPatrol(containers: Element[], index: number, webSiteState: NewsWebsite): Promise<void> {
        const link: Element = this.$(`article#${containers[index].attribs.id} a` as SelectorType).get()[0];

        await this.sendNews(
            link.attribs.href,
            // eslint-disable-next-line
            (link.children[0] as any).data,
            `Nouvelle rumeur venant de ${webSiteState.name}`,
            webSiteState,
            this.$(`article#${containers[index].attribs.id} img`).attr('src')
        );
    }
}
