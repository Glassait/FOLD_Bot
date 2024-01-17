import { readFileSync } from 'fs';
import { Channel, InventoryType, TriviaType, WebSiteState } from '../types/inventory.type';
import { EnvUtil } from '../utils/env.util';
import { Logger } from '../classes/logger';
import { Client, TextChannel } from 'discord.js';
import { Context } from '../classes/context';
import { FileUtil } from '../utils/file.util';
import { DiscordId } from '../types/feature.type';

/**
 * Class used to manage the inventory.json file
 * This class implement the Singleton pattern
 */
export class InventorySingleton {
    /**
     * The path to the inventory.json file
     */
    public readonly path: string = './src/inventory.json';

    /**
     * The logger to log thing
     * @private
     */
    private readonly logger: Logger = new Logger(new Context(InventorySingleton.name));
    /**
     * The data of the inventory
     * @private
     */
    private readonly _inventory: InventoryType;

    /**
     * The id of the dev channel
     * @private
     */
    private readonly DEV_CHANNEL: Channel = { guild: '840375560785231962', id: '1171525891604623472' };

    /**
     * Private constructor to respect the singleton pattern
     * @private
     * @constructor
     */
    private constructor() {
        this._inventory = JSON.parse(readFileSync(this.path).toString());

        if (EnvUtil.isDev() && this._inventory) {
            this._inventory.newsLetter.channel = this.DEV_CHANNEL;
            this._inventory.game.trivia.channel = this.DEV_CHANNEL;
            this._inventory.fold_recruitment.channel = this.DEV_CHANNEL;
        }
    }

    /**
     * The instance of the class, used for the singleton pattern
     * @private
     */
    private static _instance: InventorySingleton | undefined;

    /**
     * Getter for {@link _instance}
     */
    public static get instance(): InventorySingleton {
        if (!this._instance) {
            this._instance = new InventorySingleton();
            this._instance.logger.trace('Inventory instance initialized');
        }
        return this._instance;
    }

    /**
     * Get the number of newsletter in the inventory
     */
    public get numberOfNewsletter(): number {
        return this._inventory.newsLetter.website.length;
    }

    /**
     * Get the trivia information from the inventory
     */
    public get trivia(): TriviaType {
        return this._inventory.game.trivia;
    }

    /**
     * Update the trivia information with the new value and update the json file
     * @param trivia The new value
     */
    public set trivia(trivia: TriviaType) {
        this._inventory.game.trivia = trivia;
        FileUtil.writeIntoJson(this.path, this._inventory);
    }

    /**
     * Get the schedule of the trivia game
     *
     * @return The schedule of the trivia game
     */
    public get triviaSchedule(): number[] {
        return this._inventory.game.trivia.schedule;
    }

    /**
     * Get the last page used for the trivia game
     *
     * @return The last page used for the trivia game
     */
    public get triviaLastPage(): number[] {
        return this._inventory.game.trivia.last_tank_page;
    }

    /**
     * Set the last page used for the trivia game
     * @param lastPage The last page used for the trivia game
     */
    public set triviaLastPage(lastPage: number[]) {
        this._inventory.game.trivia.last_tank_page = lastPage;
        FileUtil.writeIntoJson(this.path, this._inventory);
    }

    /**
     * Get the website at the index
     * @param index The index of the website
     * @throws Error If the index is out of bound
     */
    public getNewsLetterAtIndex(index: number): WebSiteState {
        let webSiteState = this._inventory.newsLetter.website[index];

        if (!webSiteState) {
            this.logger.error(`Index out of bound ${index} in newsletter array`);
            throw new Error(`Index out of bound ${index} in newsletter array`);
        }

        return webSiteState;
    }

    /**
     * Get the channel in the discord server to send the news
     */
    public async getNewsLetterChannel(client: Client): Promise<TextChannel> {
        return await this.fetchChannel(client, this._inventory.newsLetter.channel);
    }

    /**
     * Update the last news send by the bot.
     * Update the inventory.json file
     * @param url The new url
     * @param newsLetterName The name of the website
     */
    public updateLastUrlOfWebsite(url: string, newsLetterName: string): void {
        const webSite: WebSiteState | undefined = this._inventory.newsLetter.website.find(
            (value: WebSiteState): boolean => value.name === newsLetterName
        );

        if (!webSite) {
            this.logger.error(`This website ${newsLetterName} is not registered in the inventory`);
            return;
        }

        const index: number = this._inventory.newsLetter.website.indexOf(webSite);
        this._inventory.newsLetter.website[index].lastUrl = url;
        FileUtil.writeIntoJson(this.path, this._inventory);
    }

    /**
     * Get the channel for the trivia game
     * @param client
     */
    public async getChannelForTrivia(client: Client): Promise<TextChannel> {
        this.logger.trace('Channel instance fetch for the trivia game');
        return await this.fetchChannel(client, this._inventory.game.trivia.channel);
    }

    /**
     * Get the channel for the fold recruitment
     * @param client
     */
    public async getChannelForFoldRecruitment(client: Client): Promise<TextChannel> {
        this.logger.trace('Channel instance fetch for the fold recruitment');
        return await this.fetchChannel(client, this._inventory.fold_recruitment.channel);
    }

    /**
     * Update the last time a clan joined the fold recruitment.
     * Update the inventory.json file
     * @param clanID The ID of the clan
     * @param timestamp The timestamp of the last join
     */
    public updateLastClan(clanID: string, timestamp: string): void {
        this._inventory.fold_recruitment[clanID] = timestamp;
        FileUtil.writeIntoJson(this.path, this._inventory);
    }

    /**
     * Get the last time a clan joined the fold recruitment.
     * @param clanID The ID of the clan
     * @returns The timestamp of the last join
     */
    public getLastActivityOfClan(clanID: string): string {
        return this._inventory.fold_recruitment[clanID] as string;
    }

    /**
     * Delete a clan from the fold recruitment
     * @param clanID The ID of the clan
     */
    public deleteClan(clanID: string): void {
        delete this._inventory.fold_recruitment[clanID];
        FileUtil.writeIntoJson(this.path, this._inventory);
    }

    /**
     * Get the commands registered in the inventory
     * @param name The name of the command
     * @returns The list of the discord id
     */
    public getCommands(name: string): DiscordId[] {
        const command = this._inventory.commands[name];

        if (!command) {
            throw new Error(`No command found with name ${name}`);
        }

        return command;
    }

    /**
     * Get the value of a feature in the fold recruitment
     * @param feature The feature to retrieve
     */
    public getFeatureFlippingRecruitment(feature: 'header_clan' | 'footer_message'): boolean {
        return this._inventory.fold_recruitment.feature[feature];
    }

    /**
     * Get the text channel from the cache and if is not load fetch it from the guild manager
     * @param client The Discord.js client.
     * @param channel The channel information.
     * @returns The Discord channel.
     * @private
     */
    private async fetchChannel(client: Client, channel: Channel): Promise<TextChannel> {
        let chan: TextChannel | undefined = <TextChannel>client.channels.cache.get(channel.id);

        if (!chan) {
            const g = await client.guilds.fetch(channel.guild);
            return <TextChannel>await g.channels.fetch(channel.id);
        }

        return chan;
    }
}
