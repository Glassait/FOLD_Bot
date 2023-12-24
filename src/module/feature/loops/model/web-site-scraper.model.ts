import { AxiosInstance, AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import { CheerioAPI } from 'cheerio';
import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import { InventorySingleton } from '../../../shared/singleton/inventory.singleton';
import { AxiosInjector, InventoryInjector, LoggerInjector } from '../../../shared/decorators/injector.decorator';
import { Logger } from '../../../shared/classes/logger';
import { WebsiteNameEnum } from '../enums/website-name.enum';
import { WebSiteState } from '../../../shared/types/inventory.type';

@LoggerInjector
@InventoryInjector
@AxiosInjector
export class WebSiteScraper {
    /**
     * The channel for the newsletter
     * @private
     */
    private channel: TextChannel;

    /**
     * @instance Of axios
     * @private
     */
    private readonly axios: AxiosInstance;
    /**
     * @instance Of the inventory
     * @private
     */
    private readonly inventory: InventorySingleton;
    /**
     * @instance Of the logger
     * @private
     */
    private readonly logger: Logger;

    /**
     * Fetch the channel for the newsletter
     * @param client The discord client of the bot
     */
    public async fetchChannel(client: Client): Promise<void> {
        this.channel = await this.inventory.getNewsLetterChannel(client);
    }

    /**
     * Launch the scrapping of the newsletter at the specific index
     * @param index The index of the website in the array
     */
    public async scrapWebsiteAtIndex(index: number): Promise<void> {
        const newsLetter: WebSiteState = this.inventory.getNewsLetterAtIndex(index);
        this.logger.trace(`⛏️ Start scrapping ${newsLetter.name}`);

        try {
            const response: AxiosResponse<any> = await this.axios.get(newsLetter.liveUrl);
            this.logger.trace(`⛏️ Html get for scrapping`);
            await this.getLastNews(response.data, newsLetter);
        } catch (e) {
            this.logger.error(`${e}`);
        }
    }

    /**
     * Use the Cheerios API to scrap the html
     * @param html The html of the website
     * @param webSiteState The website
     */
    public async getLastNews(html: string, webSiteState: WebSiteState): Promise<void> {
        const $: CheerioAPI = cheerio.load(html);
        if (webSiteState.name === WebsiteNameEnum.WOT_EXPRESS) {
            const links: any[] = $(webSiteState.selector).get();
            const index: number = links.indexOf(links.find(value => value.attribs.href == webSiteState.lastUrl));

            if (!webSiteState.lastUrl) {
                await this.wotExpress(links, 1, webSiteState);
            } else if (index > 0) {
                for (let i = index - 1; i >= 1; i--) {
                    await this.wotExpress(links, i, webSiteState);
                }
            }
        } else if (webSiteState.name === WebsiteNameEnum.THE_DAILY_BOUNCE) {
            let containers: any[] = $(webSiteState.selector).get();
            const links: any[] = $(`${webSiteState.selector} div.read-img a`).get();
            let index: number = links.indexOf(links.find(value => value.attribs.href == webSiteState.lastUrl));

            if (!webSiteState.lastUrl) {
                await this.dailyBounce(containers, links, 0, $, webSiteState);
            } else if (index > 0) {
                for (let i = index - 1; i >= 0; i--) {
                    await this.dailyBounce(containers, links, i, $, webSiteState);
                }
            }
        } else if (webSiteState.name === WebsiteNameEnum.THE_ARMORED_PATROL) {
            let containers: any[] = $(webSiteState.selector).get();
            let index: number = containers.indexOf(
                containers.find(value => value.children[1].children[1].children[0].attribs.href == webSiteState.lastUrl)
            );

            if (!webSiteState.lastUrl) {
                await this.armoredPatrol(containers, 0, $, webSiteState);
            } else if (index > 0) {
                for (let i = index - 1; i >= 0; i--) {
                    await this.armoredPatrol(containers, i, $, webSiteState);
                }
            }
        }
    }

    /**
     * Scrap the Armored Patrol website
     * @param containers The html container
     * @param index The index of the url of the news
     * @param $ The cheerio api
     * @param webSiteState The website
     * @private
     */
    private async armoredPatrol(containers: any[], index: number, $: CheerioAPI, webSiteState: WebSiteState): Promise<void> {
        const link: any = $(`article#${containers[index].attribs.id} a`).get()[0];

        await this.sendNews(
            link.attribs.href,
            link.children[0].data,
            `Nouvelle rumeur venant de ${webSiteState.name}`,
            webSiteState,
            $(`article#${containers[index].attribs.id} img`).attr('src')
        );
    }

    /**
     * Scrap the wot express website
     * @param links All the tags of the html containing the news url
     * @param index The index of the url
     * @param webSiteState The website
     */
    private async wotExpress(links: any[], index: number, webSiteState: WebSiteState): Promise<void> {
        await this.sendNews(
            links[index].attribs.href,
            webSiteState.name,
            `Nouvelle rumeur venant de ${webSiteState.name}`,
            webSiteState,
            links[index].children[0].attribs.style.split('url(/')[1].split(')')[0]
        );
    }

    /**
     * Scrap the daily bounce website
     * @param containers The html container
     * @param links All the tags of the html containing the news url
     * @param index The index of the url
     * @param $ The cheerio api
     * @param webSiteState The website
     */
    private async dailyBounce(containers: any[], links: any[], index: number, $: CheerioAPI, webSiteState: WebSiteState): Promise<void> {
        const title: any = $(`${webSiteState.selector}#${containers[index].attribs.id} div.read-title a`).get()[0];
        const description: any = $(`${webSiteState.selector}#${containers[index].attribs.id} div.post-description p`).get()[0];
        await this.sendNews(
            links[index].attribs.href,
            title.children[0].data,
            description.children[0].data,
            webSiteState,
            links[index].children[1].attribs['data-large-file']
        );
    }

    /**
     * Send the news to the channel
     * @param url The url of the news
     * @param title The title of the news
     * @param description The description of the news
     * @param webSiteState The website of the news
     * @param image The image of the news
     */
    private async sendNews(url: string, title: string, description: string, webSiteState: WebSiteState, image?: string): Promise<void> {
        this.logger.debug(`📨 Sending news on channel ${this.channel.name} for the web site ${webSiteState.name}, with the url ${url}`);
        this.inventory.updateLastUrlOfWebsite(url, webSiteState.name);
        const embed: EmbedBuilder = new EmbedBuilder().setTitle(title).setDescription(description).setURL(url);

        if (image) {
            embed.setImage(image.indexOf('http') > -1 ? image : webSiteState.liveUrl + image);
        }

        await this.channel.send({ embeds: [embed] });
    }
}
