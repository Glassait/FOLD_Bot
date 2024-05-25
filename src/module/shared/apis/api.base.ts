import type { AxiosInstance } from 'axios';
import { Singleton } from '../decorators/injector/singleton-injector.decorator';
import { TimeEnum } from '../enums/time.enum';
import type { Logger } from '../utils/logger';

/**
 * A base class for making API requests.
 */
export class ApiBase {
    //region INJECTION
    protected readonly logger: Logger;
    @Singleton('Axios', TimeEnum.SECONDE * 30) private readonly axios: AxiosInstance;
    //endregion

    /**
     * @param {string} BASE_URL - The base URL for the API.
     */
    constructor(private readonly BASE_URL: string) {}

    /**
     * Creates a complete URL by combining the base URL and an endpoint.
     *
     * @param {string} endpoint - The endpoint to append to the base URL.
     *
     * @returns {URL} - The complete URL object.
     */
    protected createUrl(endpoint: string): URL {
        return new URL(endpoint, this.BASE_URL);
    }

    /**
     * Adds a search parameter to a given URL.
     *
     * @param {URL} url - The URL to which the search parameter will be added.
     * @param {string} key - The key of the search parameter.
     * @param {any} value - The value of the search parameter.
     */
    protected addSearchParam(url: URL, key: string, value: any): void {
        url.searchParams.append(key, String(value));
    }

    /**
     * Makes a GET request to the given URL and returns the response data.
     *
     * @param {string | URL} url - The URL to make the GET request to.
     *
     * @returns {Promise<GData>} - A promise that resolves to the response data.
     *
     * @template GData - The data get from the call
     */
    protected async getData<GData>(url: string | URL): Promise<GData> {
        this.logger.debug('HTTP(S) call to {}', url);
        return (await this.axios.get(url.toString(), { responseType: 'json' })).data;
    }
}
