import { readFileSync, writeFile } from 'fs';
import { InventoryType, WebSiteState } from '../types/inventory.type';
import { Context } from '../classes/context';
import { EnvUtil } from '../utils/env.util';
import { LoggerDecorator } from '../decorators/loggerDecorator';
import { Logger } from '../classes/logger';
import { Client, TextChannel } from 'discord.js';
import { guild_id } from '../../../config.json';

/**
 * Class used to manage the inventory.json file
 * This class implement the Singleton pattern
 */
@LoggerDecorator
export class InventorySingleton extends Context {
    /**
     * The path to the inventory.json file
     */
    public readonly path: string = './src/inventory.json';

    /**
     * Logger instance
     * @private
     * @see LoggerDecorator
     */
    private readonly logger: Logger;
    /**
     * The data of the inventory
     * @private
     */
    private readonly _inventory: InventoryType;

    constructor() {
        super(InventorySingleton);

        const json: Buffer = readFileSync(this.path);
        this._inventory = JSON.parse(json.toString());

        if (EnvUtil.isDev() && this._inventory) {
            this._inventory.newsLetter.channel = '1171525891604623472';
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
        let channel: TextChannel | undefined = <TextChannel>client.channels.cache.get(this._inventory.newsLetter.channel);

        if (!channel) {
            const g = await client.guilds.fetch(guild_id);
            return <TextChannel>await g.channels.fetch(this._inventory.newsLetter.channel);
        }

        return channel;
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
        if (!this._inventory) {
            this.logger.error('No inventory found !');
            return;
        }

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
}
