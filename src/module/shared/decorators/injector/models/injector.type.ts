/**
 * Base type to define a class
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
export type Constructor<G = unknown> = new (...args: any[]) => G;

/**
 * All the singleton that can be injected with the decorator
 */
export type SingletonDependence = 'Axios' | 'BotDatabase';

/**
 * All the api that can be injected with the decorator
 */
export type ApiDependence = 'Wot' | 'Tomato' | 'Wargaming';
