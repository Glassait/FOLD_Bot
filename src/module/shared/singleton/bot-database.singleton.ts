import { basename } from 'node:path';
import { bdd } from 'core/config.json';
import { Logger } from 'utils/logger';
import { DatabaseAbstract } from 'abstracts/database.abstract';

/**
 * Singleton class for managing MySQL dedicated Bot database connections.
 */
export class BotDatabaseSingleton extends DatabaseAbstract {
    //region SINGLETON
    /**
     * The instance of the class, used for the singleton pattern
     */
    private static _instance?: BotDatabaseSingleton;

    /**
     * Gets the singleton instance of BotDatabaseSingleton.
     *
     * @returns {BotDatabaseSingleton} - The singleton instance.
     */
    public static get instance(): BotDatabaseSingleton {
        if (!this._instance) {
            this._instance = new BotDatabaseSingleton();
        }
        return this._instance;
    }
    //endregion

    /**
     * Private constructor for the BotDatabaseSingleton class.
     */
    private constructor() {
        super(bdd.bot, new Logger(basename(__filename)));
    }
}
