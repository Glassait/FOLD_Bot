import { TableAbstract } from '../../abstracts/table.abstract';
import { SelectBuilder } from '../../builders/query/select.builder';
import { LoggerInjector } from '../../decorators/injector/logger-injector.decorator';

/**
 * Represents a table for storing information related to Fold Recruitment.
 */
@LoggerInjector
export class FoldRecruitmentTable extends TableAbstract {
    constructor() {
        super('fold_recruitment');
    }

    /**
     * Get the minimal wn8 for the fold recruitment
     */
    public async getMinWn8(): Promise<number> {
        return (await this.select<{ wn8_min: number }>(new SelectBuilder(this).columns('wn8_min')))[0].wn8_min;
    }

    /**
     * Get the minimal amount of random battles for the fold recruitment
     */
    public async getMinBattles(): Promise<number> {
        return (await this.select<{ battles_min: number }>(new SelectBuilder(this).columns('battles_min')))[0].battles_min;
    }

    /**
     * Get the minimal amount of random battles on the last 28 days for the fold recruitment
     */
    public async getMinRandom28(): Promise<number> {
        return (await this.select<{ random_min_28: number }>(new SelectBuilder(this).columns('random_min_28')))[0].random_min_28;
    }

    /**
     * Get the minimal amount of fort sorties on the last 28 days for the fold recruitment
     */
    public async getMinFortSorties28(): Promise<number> {
        return (await this.select<{ fort_sorties_min_28: number }>(new SelectBuilder(this).columns('fort_sorties_min_28')))[0]
            .fort_sorties_min_28;
    }

    /**
     * Get the minimal amount of fort battles on the last 28 days for the fold recruitment
     */
    public async getMinFortBattles28(): Promise<number> {
        return (await this.select<{ fort_battles_min_28: number }>(new SelectBuilder(this).columns('fort_battles_min_28')))[0]
            .fort_battles_min_28;
    }

    /**
     * Get the minimum limit of battles based on the type.
     *
     * @param {'random' | 'fort_battles' | 'fort_sorties'} type - The type of battles.
     *
     * @returns {Promise<number>} - Returns the minimum limit of battles for the given type.
     */
    public async getLimitByType(type: 'random' | 'fort_battles' | 'fort_sorties'): Promise<number> {
        switch (type) {
            case 'random':
                return this.getMinRandom28();
            case 'fort_battles':
                return this.getMinFortBattles28();
            case 'fort_sorties':
                return this.getMinFortSorties28();
            default:
                throw new Error('Invalid battle type');
        }
    }
}
