import { EnvUtil } from '../../../../shared/utils/env.util';
import { TimeEnum } from '../../../../shared/enums/time.enum';
import { WebSiteState } from '../../../../shared/types/inventory.type';
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
     * @param {WebSiteState} webSiteState - The state of the website.
     */
    public async scrap(webSiteState: WebSiteState): Promise<void> {
        const links: any[] = this.$(webSiteState.selector).get();
        let index: number = links.findIndex((link: any): boolean => link.attribs.href == webSiteState.lastUrl);

        if (index === -1) {
            index = this.defaultIndex;
        }

        if (!webSiteState.lastUrl) {
            await this.wotExpress(links, 1, webSiteState);
        } else if (index > 0) {
            for (let i = index - 1; i >= 1; i--) {
                await this.wotExpress(links, i, webSiteState);
                await EnvUtil.sleep(TimeEnum.MINUTE);
            }
        }
    }

    /**
     * Scrapes news from a specific page of Wot Express website.
     *
     * @param {any[]} links - The list of links on the page.
     * @param {number} index - The index of the link to scrape.
     * @param {WebSiteState} webSiteState - The state of the website.
     */
    private async wotExpress(links: any[], index: number, webSiteState: WebSiteState): Promise<void> {
        const isEu = links[index].children[2]?.attribs.class?.includes('eu');

        await this.sendNews(
            links[index].attribs.href,
            `${webSiteState.name} : ${isEu ? 'EU news' : 'RU news'}`,
            `Nouvelle rumeur venant de ${webSiteState.name}`,
            webSiteState,
            links[index].children[0].attribs.style.split('url(/')[1].split(')')[0]
        );
    }
}
