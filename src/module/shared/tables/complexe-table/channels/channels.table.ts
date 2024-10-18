import { TableAbstract } from 'abstracts/table.abstract';
import { SelectBuilder } from 'builders/query/select.builder';
import { LoggerInjector } from 'decorators/injector/logger-injector.decorator';
import type { Channel } from './models/channels.type';
import { SingletonClass } from "decorators/injector/singleton-injector.decorator";

/**
 * Represents a ChannelsTable class for managing channels.
 */
@LoggerInjector
@SingletonClass('BotDatabase')
export class ChannelsTable extends TableAbstract {
    constructor() {
        super('channels');
    }

    /**
     * Retrieves the news website channel.
     *
     * @returns {Promise<Channel>} - A promise that resolves to the news website channel.
     */
    public async getNewsWebsite(): Promise<Channel> {
        return await this.getChannel('news');
    }

    /**
     * Retrieves the fold recruitment channel.
     *
     * @returns {Promise<Channel>} - A promise that resolves to the fold recruitment channel.
     */
    public async getFoldRecruitment(): Promise<Channel> {
        return await this.getChannel('fold-recruitment');
    }

    /**
     * Retrieves the wot-news-forum channel.
     *
     * @returns {Promise<Channel>} - A promise that resolves to the wot-news-forum channel.
     */
    public async getWotNews(): Promise<Channel> {
        return await this.getChannel('wot-news-forum');
    }

    /**
     * Retrieves a channel by name.
     * If in devMode always return the dev channel
     *
     * @param {string} name - The name of the channel.
     *
     * @returns {Promise<Channel>} - A promise that resolves to the channel.
     */
    private async getChannel(name: string): Promise<Channel> {
        return (await this.select<Channel>(new SelectBuilder(this).columns('*').where([`feature_name LIKE '${name}'`])))[0];
    }
}
