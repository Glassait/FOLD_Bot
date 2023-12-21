import { AxiosInstance } from 'axios';
import { AxiosInjector, LoggerInjector } from '../../../shared/decorators/injector.decorator';
import { Logger } from '../../../shared/classes/logger';
import { TankopediaVehicle, TankopediaVehiclesSuccess } from './wot-api.type';
import { application_id_wot } from '../../../../config.json';

@LoggerInjector
@AxiosInjector
export class WotApiModel {
    private readonly WOT_API = 'https://api.worldoftanks.eu/';

    /**
     * The axios instance
     * @private
     */
    private readonly axios: AxiosInstance;
    /**
     * The logger instance
     * @private
     */
    private readonly logger: Logger;

    /**
     * Call the World of Tanks api with the following url
     * @param url The url to call
     */
    public async fetchApi(url: string): Promise<TankopediaVehiclesSuccess> {
        url = this.WOT_API + url.replace('applicationId', application_id_wot);
        this.logger.trace(`🪖 Fetching wot api with url ${url}`);

        const data: TankopediaVehicle = (await this.axios.get(url)).data;

        if (data.status === 'error') {
            throw new Error(`${JSON.stringify(data.error)}`);
        }

        return data;
    }
}
