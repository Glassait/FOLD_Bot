import type { CheerioAPI } from 'cheerio';
import { Colors, EmbedBuilder, type TextChannel } from 'discord.js';
import type { Logger } from '../../../../shared/classes/logger';
import { Injectable, LoggerInjector, TableInjectable } from '../../../../shared/decorators/injector.decorator';
import { EmojiEnum } from '../../../../shared/enums/emoji.enum';
import type { InventorySingleton } from '../../../../shared/singleton/inventory.singleton';
import type { NewsWebsiteTable } from '../../../../shared/tables/news-website.table';
import type { NewsWebsite } from '../../../../shared/types/news_website.type';

/**
 * Class responsible for scraping news and sending them to a designated channel.
 */
@LoggerInjector
export class NewsScrapper {
    //region INJECTABLE
    private readonly logger: Logger;
    @Injectable('Inventory') private readonly inventory: InventorySingleton;
    @TableInjectable('NewsWebsite') private readonly newsWebsite: NewsWebsiteTable;
    //endregion

    /**
     * Constructs a new instance of the NewsScrapper class.
     *
     * @param {CheerioAPI} $ - The Cheerio instance for parsing HTML.
     * @param {TextChannel} channel - The Discord text channel for sending news.
     */
    constructor(
        protected $: CheerioAPI,
        private channel: TextChannel
    ) {}

    /**
     * Sends news to the designated channel.
     *
     * @param {string} url - The URL of the news article.
     * @param {string} title - The title of the news article.
     * @param {string} description - The description of the news article.
     * @param {NewsWebsite} newsWebsite - The  website from which the news is scraped.
     * @param {string} [image] - The URL of the image associated with the news article.
     */
    protected async sendNews(url: string, title: string, description: string, newsWebsite: NewsWebsite, image?: string): Promise<void> {
        const updated: boolean = await this.newsWebsite.updateWebsite(newsWebsite.name, url);

        if (updated) {
            newsWebsite.lastUrl = url;
        }

        if (this.checkHrefContainBanWord(url)) {
            this.logger.debug(`${EmojiEnum.TRASH} {} contains ban words !`, url);
            return;
        }

        this.logger.info(
            `${EmojiEnum.LETTER} Sending news on channel {} for the web site {}, with the url {}`,
            this.channel.name,
            newsWebsite.name,
            url
        );
        const embed: EmbedBuilder = new EmbedBuilder().setTitle(title).setDescription(description).setURL(url).setColor(Colors.DarkGrey);

        if (image) {
            embed.setImage(image.startsWith('http') ? image : newsWebsite.liveUrl + image);
        }

        await this.channel.send({ embeds: [embed] });
    }

    /**
     * Checks if a URL contains any banned words.
     *
     * @param {string} href - The URL to check.
     *
     * @returns {boolean} - True if the URL contains banned words, otherwise false.
     */
    private checkHrefContainBanWord(href: string): boolean {
        return this.inventory.banWords.some((banWord: string): boolean => href.includes(banWord));
    }
}
