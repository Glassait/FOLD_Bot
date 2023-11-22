import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import { CheerioAPI } from 'cheerio';
import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import { InventorySingleton } from '../singleton/inventory.singleton';
import { LoggerSingleton } from '../singleton/logger.singleton';
import { WebSiteState } from '../types/inventory.type';
import { Context } from './context.class';

export class WebSiteScraper extends Context {
    private webSiteState: WebSiteState;

    private readonly channel: string;
    private readonly axiosInstance: AxiosInstance;

    private readonly inventory: InventorySingleton = InventorySingleton.instance;
    private readonly logger: LoggerSingleton = LoggerSingleton.instance;

    constructor() {
        super(WebSiteScraper);
        this.axiosInstance = axios.create();
        const channel: string | undefined = this.inventory.getNewsLetterChannel();

        if (!channel) {
            this.logger.error(
                this.context,
                `The channel for the news letter not found in the inventory`
            );
            return;
        }

        this.channel = channel;
    }

    public getHtml(websiteIndex: number, client: Client): void {
        const newsLetter: WebSiteState | undefined = this.inventory.getNewsLetter(websiteIndex);
        if (!newsLetter) {
            this.logger.warning(
                this.context,
                `Index out of bound ${websiteIndex} in newsletter array`
            );
            return;
        }

        this.webSiteState = newsLetter;
        this.axiosInstance
            .get(this.webSiteState?.liveUrl)
            .then((response: AxiosResponse<any>): void => {
                this.getLastNews(response.data, client).then();
            })
            .catch(console.error);
    }

    public async getLastNews(html: string, client: Client): Promise<void> {
        const channel: TextChannel | undefined = <TextChannel>(
            client.channels.cache.get(this.channel)
        );

        if (!channel) {
            this.logger.error(this.context, `Channel ${this.channel} not found in the guild`);
            return;
        }

        const $: CheerioAPI = cheerio.load(html);
        if (this.webSiteState.name === 'Wot Express') {
            const links: any[] = $(this.webSiteState.selector).get();
            const index: number = links.indexOf(
                links.find(value => value.attribs.href == this.webSiteState.lastUrl)
            );

            if (!this.webSiteState.lastUrl) {
                await this.wotExpress(channel, links, 0);
            } else if (index > 0) {
                for (let i = index - 1; i >= 0; i--) {
                    await this.wotExpress(channel, links, i);
                }
            }
        } else if (this.webSiteState.name === 'THE DAILY BOUNCE') {
            let containers: any[] = $(this.webSiteState.selector).get();
            let index: number = containers.indexOf(
                containers.find(
                    value => value.children[0].children[1].attribs.href == this.webSiteState.lastUrl
                )
            );

            if (!this.webSiteState.lastUrl) {
                await this.dailyBounce(channel, containers, 0);
            } else if (index > 0) {
                for (let i = index - 1; i >= 0; i--) {
                    await this.dailyBounce(channel, containers, i);
                }
            }
        } else if (this.webSiteState.name === 'The Armored Patrol') {
            let containers: any[] = $(this.webSiteState.selector).get();
            let index: number = containers.indexOf(
                containers.find(
                    value =>
                        value.children[1].children[1].children[0].attribs.href ==
                        this.webSiteState.lastUrl
                )
            );

            if (!this.webSiteState.lastUrl) {
                await this.armoredPatrol(channel, containers, 0);
            } else if (index > 0) {
                for (let i = index - 1; i >= 0; i--) {
                    await this.armoredPatrol(channel, containers, i);
                }
            }
        }
    }

    private async armoredPatrol(channel: TextChannel, containers: any[], index: number) {
        const link = containers[index].children[1].children[1].children[0];
        const image =
            containers[index].children[7].children[1].children[1].children[1].children[0]
                .children[0].attribs.src;
        await this.sendNews(
            channel,
            link.attribs.href,
            link.children[0].data,
            `Nouvelle rumeur venant de ${this.webSiteState.name}`,
            image
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

    private async dailyBounce(
        channel: TextChannel,
        containers: any[],
        index: number
    ): Promise<void> {
        const link: any = containers[index].children[0];
        const description: any = containers[index].children[1];
        await this.sendNews(
            channel,
            link.children[1].attribs.href,
            description.children[1].children[0].children[1].children[0].data,
            description.children[6].children[0].children[0].children[0].data,
            link.children[1].children[1].attribs['data-large-file']
        );
    }

    private async sendNews(
        channel: TextChannel,
        url: string,
        title: string,
        description: string,
        image?: string
    ): Promise<void> {
        this.logger.debug(
            this.context,
            `Sending news on channel ${channel.name} for the web site ${this.webSiteState.name}, with the url ${url}`
        );
        this.inventory.updateLastUrlOfWebsite(url, this.webSiteState.name);
        const embed: EmbedBuilder = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setURL(url);

        if (image) {
            embed.setImage(image.indexOf('http') > -1 ? image : this.webSiteState.liveUrl + image);
        }

        await channel.send({ embeds: [embed] });
    }

    private getUrlBackground(style: string): string {
        return style.split('url(/')[1].split(')')[0];
    }
}
