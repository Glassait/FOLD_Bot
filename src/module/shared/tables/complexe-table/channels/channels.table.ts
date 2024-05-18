import { TableAbstract } from '../../../abstracts/table.abstract';
import { SelectBuilder } from '../../../builders/query/select.builder';
import { LoggerInjector } from '../../../decorators/injector/logger-injector.decorator';
import { EnvUtil } from '../../../utils/env.util';
import type { Channel } from './models/channels.type';

/**
 * Represents a ChannelsTable class for managing channels.
 */
@LoggerInjector
export class ChannelsTable extends TableAbstract {
    /**
     * Represents the development channel.
     */
    private readonly DEV_CHANNEL: Channel = { guild_id: '1218558386761891901', channel_id: '1218558387361546412' };

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
     * Retrieves the trivia channel.
     *
     * @returns {Promise<Channel>} - A promise that resolves to the trivia channel.
     */
    public async getTrivia(): Promise<Channel> {
        return await this.getChannel('trivia');
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
     * Retrieves a channel by name.
     * If in devMode always return the dev channel
     *
     * @param {string} name - The name of the channel.
     *
     * @returns {Promise<Channel>} - A promise that resolves to the channel.
     */
    public async getChannel(name: string): Promise<Channel> {
        if (EnvUtil.isDev()) {
            return Promise.resolve(this.DEV_CHANNEL);
        }

        return ((await this.select(new SelectBuilder(this).columns('*').where([`feature_name LIKE '${name}'`]))) as any)[0];
    }
}