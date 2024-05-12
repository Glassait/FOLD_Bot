import { TableAbstract } from '../../../abstracts/table.abstract';
import { SelectBuilder } from '../../../builders/query/select.builder';
import { LoggerInjector } from '../../../decorators/injector/logger-injector.decorator';
import type { FeatureFlippingName } from './models/feature-flipping.type';

/**
 * Represents a table to manage feature flipping in the database.
 */
@LoggerInjector
export class FeatureFlippingTable extends TableAbstract {
    constructor() {
        super('feature_flipping');
    }

    /**
     * Retrieves the activation status of a feature from the database.
     *
     * @param {FeatureFlippingName} name - The name of the feature.
     *
     * @returns {Promise<boolean>} A promise that resolves to the activation status of the feature.
     */
    public async getFeature(name: FeatureFlippingName): Promise<boolean> {
        return !!((await this.select(new SelectBuilder(this).columns('is_activated').where([`name like '${name}'`]))) as any)[0]
            .is_activated;
    }
}
