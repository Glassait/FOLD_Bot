import type { ApiDependence } from './models/injector.type';

/**
 * Decorator function that injects api instances based on the provided dependence type.
 *
 * @param {ApiDependence} dependence - The type of dependence to inject. Must be a class extending `ApiDependence`.
 *
 * @returns {Function} - A decorator function that can be used to decorate class properties.
 *
 * @throws {Error} - Throws an error if an unsupported dependence type is provided.
 *
 * @template {SingletonDependence} GSingleton - The type of the dependence to inject (must extend `ApiDependence`).
 *
 * @example
 * import { Api } from './api-injector.decorator';
 * import { Wot } from 'path';
 *
 * class MyComponent {
 *   \@Singleton('Wot') private readonly wotApi: WotApi;
 * }
 */
export function Api<GApi extends ApiDependence>(
    dependence: GApi
    // eslint-disable-next-line @typescript-eslint/ban-types
): Function {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return function actual<GClass>(_target: GClass, _context: ClassFieldDecoratorContext<GClass, any>) {
        return function (this: GClass, field: any) {
            switch (dependence) {
                case 'Tomato':
                    field = new (require('../../apis/tomato/tomato.api').TomatoApi)();
                    break;
                case 'Wot':
                    field = new (require('../../apis/wot/wot.api').WotApi)();
                    break;
                case 'Wargaming':
                    field = new (require('../../apis/wargaming/wargaming.api').WargamingApi)();
                    break;
                default:
                    throw new Error(`Unsupported dependence type: ${dependence}`);
            }

            return field;
        };
    };
}
