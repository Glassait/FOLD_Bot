import { TimeEnum } from '../../../../shared/enums/time.enum';
import type { WebSiteState } from '../../../../shared/types/inventory.type';
import { EnvUtil } from '../../../../shared/utils/env.util';
import { NewsScrapper } from './news-scrapper.model';

/**
 * Class responsible for scraping news from The Armored Patrol website.
 */
export class TheArmoredPatrol extends NewsScrapper {
    /**
     * Scrapes news from The Armored Patrol website.
     *
     * @param {WebSiteState} webSiteState - The state of the website.
     */
    public async scrap(webSiteState: WebSiteState): Promise<void> {
        let containers: any[] = this.$(webSiteState.selector).get();
        let index: number = containers.findIndex(
            (container: any): boolean => container.children[1].children[1].children[0].attribs.href == webSiteState.lastUrl
        );

        if (!webSiteState.lastUrl) {
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
     * @param {any[]} containers - The list of containers containing news articles.
     * @param {number} index - The index of the container to scrape.
     * @param {WebSiteState} webSiteState - The state of the website.
     */
    private async armoredPatrol(containers: any[], index: number, webSiteState: WebSiteState): Promise<void> {
        const link: any = this.$(`article#${containers[index].attribs.id} a`).get()[0];

        await this.sendNews(
            link.attribs.href,
            link.children[0].data,
            `Nouvelle rumeur venant de ${webSiteState.name}`,
            webSiteState,
            this.$(`article#${containers[index].attribs.id} img`).attr('src')
        );
    }
}
