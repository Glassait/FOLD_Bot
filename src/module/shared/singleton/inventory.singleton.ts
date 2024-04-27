import { basename } from 'node:path';
import { CoreFileAbstract } from '../abstracts/core-file.abstract';
import { EmojiEnum } from '../enums/emoji.enum';
import type { InventoryType, Trivia } from '../types/inventory.type';
import { Logger } from '../utils/logger';

/**
 * Class used to manage the inventory.json file
 * This class implement the Singleton pattern
 */
export class InventorySingleton extends CoreFileAbstract<InventoryType> {
    /**
     * Private constructor for the InventorySingleton class.
     * Initializes the instance by reading the json core file and performs additional setup.
     * If running in development mode, overrides channel configurations with a development channel.
     */
    private constructor() {
        super('./src/module/core', './src/module/core/backup', 'inventory.json');

        this.logger = new Logger(basename(__filename));

        this._data = JSON.parse(this.readFile().toString());

        this.backupData();
        this.logger.info(`${EmojiEnum.HAMMER} {} instance initialized`, InventorySingleton.name);
    }

    //region SINGLETON
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
        }

        return this._instance;
    }
    //endregion

    //region TRIVIA
    /**
     * Get the trivia information from the inventory
     */
    public get trivia(): Trivia {
        return this._data.game.trivia;
    }

    /**
     * Update the trivia information with the new value and update the json file
     *
     * @param {Trivia} trivia - The new trivia value
     */
    public set trivia(trivia: Trivia) {
        this._data.game.trivia = trivia;
        this.writeData();
    }
    //endregion
}
