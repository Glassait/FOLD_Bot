import { Client } from 'discord.js';
import { readFileSync, writeFile } from 'fs';
import { InventoryType, WebSiteState } from '../types/inventory.type';
import { Context } from '../utils/context.class';
import { WebSiteScraper } from '../utils/web-site-scraper';
import { LoggerSingleton } from './logger.singleton';

export class InventorySingleton extends Context {
    public readonly path: string = './src/inventory.json';

    private readonly logger: LoggerSingleton = LoggerSingleton.instance;
    private readonly _inventory: InventoryType | undefined;

    constructor() {
        super(InventorySingleton);

        try {
            const json: Buffer = readFileSync(this.path);
            this._inventory = JSON.parse(json.toString());
        } catch (e) {
            this.logger.error(this.context, 'Inventory file not found');
            throw new Error('Inventory file not found');
        }
    }

    private static _instance: InventorySingleton | undefined;

    public static get instance(): InventorySingleton {
        if (!this._instance) {
            this._instance = new InventorySingleton();
        }
        return this._instance;
    }

    public getNewsLetter(index: number): WebSiteState | undefined {
        return this._inventory?.newsLetter.website[index];
    }

    public getNewsLetterChannel(): string | undefined {
        return this._inventory?.newsLetter.channel;
    }

    public async scrapWebSite(client: Client): Promise<void> {
        const length: number | undefined = this._inventory?.newsLetter.website.length;

        if (!length) {
            this.logger.error(this.context, 'Inventory is undefined');
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
            await new Promise(r => setTimeout(r, 1000 * 60 * 30));
        }
    }

    public updateLastUrlOfWebsite(url: string, newsLetterName: string): void {
        if (!this._inventory) {
            this.logger.error(this.context, 'No inventory found !');
            return;
        }

        const webSite: WebSiteState | undefined = this._inventory.newsLetter.website.find(
            (value: WebSiteState): boolean => value.name === newsLetterName
        );

        if (!webSite) {
            this.logger.error(
                this.context,
                `This website ${newsLetterName} is not registered in the inventory`
            );
            return;
        }

        const index: number = this._inventory.newsLetter.website.indexOf(webSite);
        this._inventory.newsLetter.website[index].lastUrl = url;
        this.updateFile();
    }

    private updateFile(): void {
        writeFile(this.path, JSON.stringify(this._inventory, null, '\t'), err => {
            if (err) {
                this.logger.warning(
                    this.context,
                    `🔄❌ Failed to sync the inventory file with error: ${err}`
                );
            }
        });
    }
}
