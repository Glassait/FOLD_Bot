import type { CheerioAPI } from 'cheerio';
import { Colors, EmbedBuilder, type TextChannel } from 'discord.js';
import { LoggerInjector } from '../../../../shared/decorators/injector/logger-injector.decorator';
import { Table } from '../../../../shared/decorators/injector/table-injector.decorator';
import { EmojiEnum } from '../../../../shared/enums/emoji.enum';
import type { NewsWebsite } from '../../../../shared/tables/complexe-table/news-websites/models/news-websites.type';
import type { NewsWebsitesTable } from '../../../../shared/tables/complexe-table/news-websites/news-websites.table';
import type { BanWordsTable } from '../../../../shared/tables/simple-table/ban-words.table';
import type { Logger } from '../../../../shared/utils/logger';

/**
 * Class responsible for scraping news and sending them to a designated channel.
 */
@LoggerInjector
export class NewsScrapper {
    //region INJECTABLE
    @Table('NewsWebsites') private readonly newsWebsites: NewsWebsitesTable;
    @Table('BanWords') private readonly banWords: BanWordsTable;
    private readonly logger: Logger;
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
        const updated: boolean = await this.newsWebsites.updateWebsite(newsWebsite.name, url);

        if (updated) {
            newsWebsite.last_url = url;
        }

        if (await this.checkHrefContainBanWord(url)) {
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
            embed.setImage(image.startsWith('http') ? image : newsWebsite.live_url + image);
        }

        await this.channel.send({ embeds: [embed] });
    }

    /**
     * Checks if a URL contains any banned words.
     *
     * @param {string} href - The URL to check.
     *
     * @returns {Promise<boolean>} - True if the URL contains banned words, otherwise false.
     */
    private async checkHrefContainBanWord(href: string): Promise<boolean> {
        return (await this.banWords.getAll()).some((banWord: string): boolean => href.includes(banWord));
    }
}
