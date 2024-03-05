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
    //region PRIVATE READONLY FIELD
    /**
     * The path to the inventory.json file
     */
    private readonly path: string = './src/module/core/inventory.json';
    /**
     * The logger to log thing
     */
    private readonly logger: Logger = new Logger(new Context(InventorySingleton.name));
    /**
     * The data of the inventory
     */
    private readonly _inventory: InventoryType;
    /**
     * The id of the dev channel
     */
    private readonly DEV_CHANNEL: Channel = { guild: '840375560785231962', id: '1171525891604623472' };
    //endregion

    /**
     * Private constructor for the FeatureSingleton class.
     * Initializes the instance by reading the inventory.json file and performs additional setup.
     * If running in development mode, overrides channel configurations with a development channel.
     */
    private constructor() {
        this._inventory = JSON.parse(readFileSync(this.path).toString());

        if (EnvUtil.isDev() && this._inventory) {
            Object.entries(this._inventory.channels).forEach((channel: [string, Channel]): void => {
                this._inventory.channels[channel[0]] = this.DEV_CHANNEL;
            });
        }
    }

    /**
     * The instance of the class, used for the singleton pattern
     */
    private static _instance: InventorySingleton | undefined;

    /**
     * Getter for {@link _instance}
     */
    public static get instance(): InventorySingleton {
        if (!this._instance) {
            this._instance = new InventorySingleton();
            this._instance.logger.info('{} instance initialized', 'Inventory');
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
     * Get the schedule of the trivia game.
     * The value need to be parsed to extract the hours and the minutes
     *
     * @return The schedule of the trivia game
     */
    public get triviaSchedule(): string[] {
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
     * Get the schedule for the fold recruitment.
     * The value need to be parsed to extract the hours and the minutes
     *
     * @return The schedule of the fold recruitment
     */
    public get foldSchedule(): string[] {
        return this._inventory.fold_recruitment.schedule;
    }

    /**
     * Getter for the array of banned words used in the newsletter.
     *
     * @returns {string[]} - An array of banned words for the newsletter.
     */
    public get banWords(): string[] {
        return this._inventory.newsLetter.banWords;
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
        return await this.fetchChannel(client, this._inventory.channels.newsletter);
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
     * Fetch the text channel instance for the trivia game.
     *
     * @param {Client} client - The Discord client instance.
     * @returns {Promise<TextChannel>} - A promise that resolves to the text channel instance for the trivia game.
     *
     * @example
     * ```typescript
     * const discordClient = // ... obtained Discord client instance
     * const triviaChannel = await instance.getChannelForTrivia(discordClient);
     * console.log(triviaChannel); // Text channel instance for the trivia game
     * ```
     */
    public async getChannelForTrivia(client: Client): Promise<TextChannel> {
        this.logger.debug('Channel instance fetch for the trivia game');
        return await this.fetchChannel(client, this._inventory.channels.trivia);
    }

    /**
     * Fetch the text channel instance for the fold recruitment.
     *
     * @param {Client} client - The Discord client instance.
     * @returns {Promise<TextChannel>} - A promise that resolves to the text channel instance for the fold recruitment.
     *
     * @example
     * ```typescript
     * const discordClient = // ... obtained Discord client instance
     * const foldRecruitmentChannel = await instance.getChannelForFoldRecruitment(discordClient);
     * console.log(foldRecruitmentChannel); // Text channel instance for the fold recruitment
     * ```
     */
    public async getChannelForFoldRecruitment(client: Client): Promise<TextChannel> {
        this.logger.debug('Channel instance fetch for the fold recruitment');
        return await this.fetchChannel(client, this._inventory.channels.fold_recruitment);
    }

    /**
     * Fetch the text channel instance for the fold month.
     *
     * @param {Client} client - The Discord client instance.
     * @returns {Promise<TextChannel>} - A promise that resolves to the text channel instance for the fold month.
     *
     * @example
     * ```typescript
     * const discordClient = // ... obtained Discord client instance
     * const foldMonthChannel = await instance.getChannelForFoldMonth(discordClient);
     * console.log(foldMonthChannel); // Text channel instance for the fold month
     * ```
     */
    public async getChannelForFoldMonth(client: Client): Promise<TextChannel> {
        this.logger.debug('Channel instance fetch for the fold month message');
        return await this.fetchChannel(client, this._inventory.channels.fold_month);
    }

    /**
     * Updates the last check timestamp for a specific clan in the fold recruitment inventory.
     *
     * @param {string} clanID - The ID of the clan for which to update the last check timestamp.
     * @param {string} timestamp - The new timestamp to set as the last check for the specified clan.
     *
     * @example
     * ```typescript
     * const clanID = 'ABC123';
     * const newTimestamp = '2024-02-10T12:00:00Z';
     * instance.updateLastCheckForClan(clanID, newTimestamp);
     * ```
     */
    public updateLastCheckForClan(clanID: string, timestamp: string): void {
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
     * Retrieves the state of a feature flipping based on its name.
     *
     * @param {string} feature - The name of the feature.
     * @returns {boolean | undefined} - Returns the state of the feature if found, or `undefined` if the feature is not present.
     *
     * @example
     * ```typescript
     * const isFeatureEnabled = instance.getFeatureFlipping('myFeature');
     * if (isFeatureEnabled !== undefined) {
     *   console.log(`Feature 'myFeature' is ${isFeatureEnabled ? 'enabled' : 'disabled'}`);
     * } else {
     *   console.log(`Feature 'myFeature' not found`);
     * }
     * ```
     */
    public getFeatureFlipping(feature: string): boolean | undefined {
        return this._inventory.feature_flipping[feature];
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
