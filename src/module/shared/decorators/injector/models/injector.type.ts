/**
 * Base type to define a class
 */
export type Constructor = new (...args: any[]) => any;

/**
 * All the singleton that can be injected with the decorator
 */
export type SingletonDependence = 'Trivia' | 'Axios' | 'Database';

/**
 * All the api that can be injected with the decorator
 */
export type ApiDependence = 'Wot' | 'Tomato' | 'Wargaming';
