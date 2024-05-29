/**
 * Base type to define a class
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
export type Constructor<T> = new (...args: any[]) => T;

/**
 * All the singleton that can be injected with the decorator
 */
export type SingletonDependence = 'Trivia' | 'Axios' | 'Database';

/**
 * All the api that can be injected with the decorator
 */
export type ApiDependence = 'Wot' | 'Tomato' | 'Wargaming';
