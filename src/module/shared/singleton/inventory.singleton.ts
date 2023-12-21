import { readFileSync, writeFile } from 'fs';
import { InventoryType, TriviaType, WebSiteState } from '../types/inventory.type';
import { EnvUtil } from '../utils/env.util';
import { Logger } from '../classes/logger';
import { Client, TextChannel } from 'discord.js';
import { guild_id } from '../../../config.json';
import { Context } from '../classes/context';

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
    private readonly DEV_CHANNEL = '1171525891604623472';

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
     * Get the number of newsletter in the inventory
     */
    public get numberOfNewsletter(): number {
        return this._inventory.newsLetter.website.length;
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
        this.updateFile();
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
        this.updateFile();
    }

    /**
     * Method to update the inventory.json file
     * @private
     */
    private updateFile(): void {
        writeFile(this.path, JSON.stringify(this._inventory, null, '\t'), err => {
            if (err) {
                this.logger.warning(`🔄❌ Failed to sync the inventory file with error: ${err}`);
            } else if (this.logger) {
                this.logger.trace('Inventory successfully updated');
            }
        });
    }

    /**
     * Get the text channel from the cache and if is not load fetch it from the guild manager
     * @param client The client of the bot
     * @param id The id of the channel
     * @private
     */
    private async fetchChannel(client: Client, id: string): Promise<TextChannel> {
        let channel: TextChannel | undefined = <TextChannel>client.channels.cache.get(id);

        if (!channel) {
            const g = await client.guilds.fetch(guild_id);
            return <TextChannel>await g.channels.fetch(id);
        }

        return channel;
    }
}
