import { Colors, EmbedBuilder, ForumChannel, GuildForumTag, TextChannel } from 'discord.js';
import { LoggerInjector } from 'decorators/injector/logger-injector.decorator';
import { Table } from 'decorators/injector/table-injector.decorator';
import { EmojiEnum } from 'enums/emoji.enum';
import type { NewsWebsite } from 'tables/complexe-table/news-websites/models/news-websites.type';
import type { NewsWebsitesTable } from 'tables/complexe-table/news-websites/news-websites.table';
import type { BanWordsTable } from 'tables/simple-table/ban-words.table';
import type { Logger } from 'utils/logger';

/**
 * Class responsible for scraping news and sending them to a designated channel.
 */
@LoggerInjector
export class NewsScrapper<GParser> {
    //region INJECTABLE
    @Table('NewsWebsites') private readonly newsWebsites: NewsWebsitesTable;
    @Table('BanWords') private readonly banWords: BanWordsTable;
    private readonly logger: Logger;
    //endregion

    //region PRIVATE READONLY FIELD
    private readonly baseTag: GuildForumTag;
    //endregion

    /**
     * Constructs a new instance of the NewsScrapper class.
     *
     * @param $ - The Cheerio instance for parsing HTML.
     * @param channel - The Discord text channel for sending news.
     */
    constructor(
        protected $: GParser,
        private readonly channel: TextChannel | ForumChannel
    ) {
        if (this.channel instanceof ForumChannel) {
            this.baseTag = this.channel.availableTags.find(
                ({ name }): boolean => name.toLowerCase() === 'Autres nouveautés'.toLowerCase()
            )!;
        }
    }

    /**
     * Sends news to the designated channel.
     *
     * @param url - The URL of the news article.
     * @param title - The title of the news article.
     * @param description - The description of the news article.
     * @param newsWebsite - The  website from which the news is scraped.
     * @param [image] - The URL of the image associated with the news article.
     */
    protected async sendNews(
        url: string,
        title: string,
        description: string,
        newsWebsite: NewsWebsite,
        image?: string
    ): Promise<string[] | undefined> {
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

        if (this.channel instanceof TextChannel) {
            await this.channel.send({ embeds: [embed] });
        } else {
            return this.sendForumMessage(url, title, description, image);
        }
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

    /**
     * Send the news in an embed to a forum channel
     *
     * @param url - The url of the news
     * @param title - The title of the news
     * @param description - The description of the news
     * @param [image] - The image url of the news
     */
    private async sendForumMessage(url: string, title: string, description: string, image?: string): Promise<string[]> {
        const embed: EmbedBuilder = new EmbedBuilder().setTitle(title).setURL(url).setDescription(description).setColor(Colors.Red);

        if (image) {
            embed.setImage(image);
        }

        if (this.channel instanceof TextChannel) {
            return [];
        }

        const tags: GuildForumTag[] = this.channel.availableTags.filter(({ name }): boolean =>
            title.toLowerCase().includes(name.toLowerCase())
        );

        if (!tags.length) {
            tags.push(this.baseTag);
        }
        this.logger.debug('Crosspost wot message with tag [{}]', tags.join(', '));

        await this.channel.threads.create({
            name: title,
            message: { embeds: [new EmbedBuilder(embed.data)] },
            appliedTags: tags.map(({ id }) => id),
        });

        return tags.map(({ name }) => name);
    }
}
