import { AxiosInstance } from 'axios';
import { AxiosInjector, LoggerInjector } from '../../../shared/decorators/injector.decorator';
import { Logger } from '../../../shared/classes/logger';
import { TankopediaVehicle, TankopediaVehiclesSuccess } from '../types/wot-api.type';
import { application_id_wot } from '../../../core/config.json';
import { TimeEnum } from '../../../shared/enums/time.enum';
import { EmojiEnum } from '../../../shared/enums/emoji.enum';

@LoggerInjector
@AxiosInjector(TimeEnum.SECONDE * 30)
export class WotApiModel {
    /**
     * The base url for the wot api
     * @private
     */
    private readonly WOT_API: string = 'https://api.worldoftanks.eu/';
    /**
     * The maximum number of try when fetching vehicle's data
     * @private
     */
    private readonly maxNumberOfTry = 5;

    //region INJECTOR
    private readonly axios: AxiosInstance;
    private readonly logger: Logger;
    //endregion

    /**
     * Call the World of Tanks api with the following url
     * @param url The url to call, this url will be added the base WoT api
     * @throws Error When the answer is in error
     */
    public async fetchTankopediaApi(url: string): Promise<TankopediaVehiclesSuccess> {
        url = this.WOT_API + url.replace('applicationId', application_id_wot);
        this.logger.debug(`${EmojiEnum.SOLDIER} Fetching wot api with url ${url}`);

        let numberOfTry = 0;
        let data: TankopediaVehicle;

        do {
            data = (await this.axios.get(url)).data;
            numberOfTry++;
        } while (!data && numberOfTry < this.maxNumberOfTry);

        if (!data || data.status === 'error') {
            throw new Error(`${!data ? data : JSON.stringify(data.error)}`);
        }

        return data;
    }
}
