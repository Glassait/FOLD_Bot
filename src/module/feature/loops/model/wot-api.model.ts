import { AxiosInstance } from 'axios';
import { AxiosInjector, LoggerInjector } from '../../../shared/decorators/injector.decorator';
import { Logger } from '../../../shared/classes/logger';
import { TankopediaVehicle, TankopediaVehiclesSuccess } from '../types/wot-api.type';
import { application_id_wot } from '../../../../config.json';

@LoggerInjector
@AxiosInjector
export class WotApiModel {
    /**
     * The base url for the wot api
     * @private
     */
    private readonly WOT_API: string = 'https://api.worldoftanks.eu/';

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
     * @param url The url to call, this url will be added the base WoT api
     * @throws Error When the answer is in error
     */
    public async fetchTankopediaApi(url: string): Promise<TankopediaVehiclesSuccess> {
        url = this.WOT_API + url.replace('applicationId', application_id_wot);
        this.logger.trace(`💂 Fetching wot api with url ${url}`);

        const data: TankopediaVehicle = (await this.axios.get(url)).data;

        if (!data || data.status === 'error') {
            throw new Error(`${!data ? data : JSON.stringify(data.error)}`);
        }

        return data;
    }
}
