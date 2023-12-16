import { Client } from 'discord.js';
import { readFileSync, writeFile } from 'fs';
import { InventoryType, WebSiteState } from '../types/inventory.type';
import { Context } from '../classes/context';
import { EnvUtil } from '../utils/env.util';
import { WebSiteScraper } from '../classes/web-site-scraper';
import { LoggerDecorator } from '../decorators/loggerDecorator';
import { Logger } from '../classes/logger';

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
    private readonly _inventory: InventoryType | undefined;

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
        }
        this._instance.logger.trace('Inventory instance initialized');
        return this._instance;
    }

    /**
     * Get the website at the index
     * @param index The index of the website
     */
    public getNewsLetter(index: number): WebSiteState | undefined {
        return this._inventory?.newsLetter.website[index];
    }

    /**
     * Get the channel id where to send news
     */
    public getNewsLetterChannel(): string | undefined {
        return this._inventory?.newsLetter.channel;
    }

    /**
     * This method launch the scrapping of the website
     * @param client
     */
    public async scrapWebSite(client: Client): Promise<void> {
        const length: number | undefined = this._inventory?.newsLetter.website.length;

        if (!length) {
            this.logger.error('Inventory is undefined');
            return;
        }

        let index: number = 0;
        while (true) {
            const scraper: WebSiteScraper = new WebSiteScraper();
            scraper.getHtml(index, client);
            index++;

            if (index >= length) {
                index = 0;
            }
            this.logger.trace('End scrapping, next one in 30 minutes');
            await new Promise(r => setTimeout(r, 1000 * 60 * 30));
        }
    }

    /**
     * Update the last news send by the bot.
     * Update the inventory.josn file
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
