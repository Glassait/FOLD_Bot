import { basename } from 'node:path';
import { bdd } from 'core/config.json';
import { Logger } from 'utils/logger';
import { DatabaseAbstract } from 'abstracts/database.abstract';

/**
 * Singleton class for managing MySQL dedicated Bot database connections.
 */
export class FoldDatabaseSingleton extends DatabaseAbstract {
    //region SINGLETON
    /**
     * The instance of the class, used for the singleton pattern
     */
    private static _instance?: FoldDatabaseSingleton;

    /**
     * Gets the singleton instance of FoldDatabaseSingleton.
     *
     * @returns {FoldDatabaseSingleton} - The singleton instance.
     */
    public static get instance(): FoldDatabaseSingleton {
        if (!this._instance) {
            this._instance = new FoldDatabaseSingleton();
        }
        return this._instance;
    }
    //endregion

    /**
     * Private constructor for the FoldDatabaseSingleton class.
     */
    private constructor() {
        super(bdd["fold-backend"], new Logger(basename(__filename)));
    }
}
