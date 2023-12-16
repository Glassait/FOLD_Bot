import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import { CheerioAPI } from 'cheerio';
import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import { InventorySingleton } from '../singleton/inventory.singleton';
import { WebSiteState } from '../types/inventory.type';
import { Context } from './context';
import { LoggerDecorator } from '../decorators/loggerDecorator';
import { Logger } from './logger';

@LoggerDecorator
export class WebSiteScraper extends Context {
    private webSiteState: WebSiteState;

    private readonly channel: string;
    private readonly axiosInstance: AxiosInstance;

    private readonly inventory: InventorySingleton = InventorySingleton.instance;
    private readonly logger: Logger;

    constructor() {
        super(WebSiteScraper);
        this.axiosInstance = axios.create();
        const channel: string | undefined = this.inventory.getNewsLetterChannel();

        if (!channel) {
            throw new Error(`The channel for the news letter not found in the inventory`);
        }

        this.channel = channel;
    }

    public getHtml(websiteIndex: number, client: Client): void {
        const newsLetter: WebSiteState | undefined = this.inventory.getNewsLetter(websiteIndex);
        if (!newsLetter) {
            this.logger.warning(`Index out of bound ${websiteIndex} in newsletter array`);
            return;
        }

        this.logger.trace(`⛏️ Start scrapping ${newsLetter.name}`);
        this.webSiteState = newsLetter;
        this.axiosInstance
            .get(this.webSiteState?.liveUrl)
            .then((response: AxiosResponse<any>): void => {
                this.getLastNews(response.data, client).then();
            })
            .catch(reason => this.logger.error(reason));
    }

    public async getLastNews(html: string, client: Client): Promise<void> {
        const channel: TextChannel | undefined = <TextChannel>client.channels.cache.get(this.channel);

        if (!channel) {
            this.logger.error(`Channel ${this.channel} not found in the guild`);
            return;
        }

        const $: CheerioAPI = cheerio.load(html);
        if (this.webSiteState.name === 'Wot Express') {
            const links: any[] = $(this.webSiteState.selector).get();
            const index: number = links.indexOf(links.find(value => value.attribs.href == this.webSiteState.lastUrl));

            if (!this.webSiteState.lastUrl) {
                await this.wotExpress(channel, links, 1);
            } else if (index > 0) {
                for (let i = index - 1; i >= 1; i--) {
                    await this.wotExpress(channel, links, i);
                }
            }
        } else if (this.webSiteState.name === 'THE DAILY BOUNCE') {
            let containers: any[] = $(this.webSiteState.selector).get();
            const links: any[] = $(`${this.webSiteState.selector} div.read-img a`).get();
            let index: number = links.indexOf(links.find(value => value.attribs.href == this.webSiteState.lastUrl));

            if (!this.webSiteState.lastUrl) {
                await this.dailyBounce(channel, containers, links, 0, $);
            } else if (index > 0) {
                for (let i = index - 1; i >= 0; i--) {
                    await this.dailyBounce(channel, containers, links, i, $);
                }
            }
        } else if (this.webSiteState.name === 'The Armored Patrol') {
            let containers: any[] = $(this.webSiteState.selector).get();
            let index: number = containers.indexOf(
                containers.find(value => value.children[1].children[1].children[0].attribs.href == this.webSiteState.lastUrl)
            );

            if (!this.webSiteState.lastUrl) {
                await this.armoredPatrol(channel, containers, 0, $);
            } else if (index > 0) {
                for (let i = index - 1; i >= 0; i--) {
                    await this.armoredPatrol(channel, containers, i, $);
                }
            }
        }
    }

    private async armoredPatrol(channel: TextChannel, containers: any[], index: number, $: CheerioAPI): Promise<void> {
        const link: any = $(`article#${containers[index].attribs.id} a`).get()[0];

        await this.sendNews(
            channel,
            link.attribs.href,
            link.children[0].data,
            `Nouvelle rumeur venant de ${this.webSiteState.name}`,
            $(`article#${containers[index].attribs.id} img`).attr('src')
        );
    }

    private async wotExpress(channel: TextChannel, links: any[], i: number): Promise<void> {
        await this.sendNews(
            channel,
            links[i].attribs.href,
            this.webSiteState.name,
            `Nouvelle rumeur venant de ${this.webSiteState.name}`,
            this.getUrlBackground(links[i].children[0].attribs.style)
        );
    }

    private async dailyBounce(channel: TextChannel, containers: any[], links: any[], index: number, $: CheerioAPI): Promise<void> {
        const title: any = $(`${this.webSiteState.selector}#${containers[index].attribs.id} div.read-title a`).get()[0];
        const description: any = $(`${this.webSiteState.selector}#${containers[index].attribs.id} div.post-description p`).get()[0];
        await this.sendNews(
            channel,
            links[index].attribs.href,
            title.children[0].data,
            description.children[0].data,
            links[index].children[1].attribs['data-large-file']
        );
    }

    private async sendNews(channel: TextChannel, url: string, title: string, description: string, image?: string): Promise<void> {
        this.logger.debug(`📨 Sending news on channel ${channel.name} for the web site ${this.webSiteState.name}, with the url ${url}`);
        this.inventory.updateLastUrlOfWebsite(url, this.webSiteState.name);
        const embed: EmbedBuilder = new EmbedBuilder().setTitle(title).setDescription(description).setURL(url);

        if (image) {
            embed.setImage(image.indexOf('http') > -1 ? image : this.webSiteState.liveUrl + image);
        }

        await channel.send({ embeds: [embed] });
    }

    private getUrlBackground(style: string): string {
        return style.split('url(/')[1].split(')')[0];
    }
}
