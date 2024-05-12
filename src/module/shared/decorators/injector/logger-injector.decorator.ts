import { ContextAbstract } from '../../abstracts/context.abstract';
import type { Constructor } from './models/constructor.type';

/**
 * Decorator function that injects a logger instance into a class.
 *
 * @param {Constructor} target - The class to inject the logger into.
 * @param {ClassDecoratorContext} _context - The decorator context (unused).
 *
 * @returns {Constructor} - The decorated class with the logger injected.
 *
 * @template GClass - The class type to inject the logger into.
 *
 * @example
 * import { LoggerInjector } from './logger-injector.decorator';
 * import type { Logger } from '../../utils/logger';
 *
 * \@LoggerInjector()
 * class MyClass {
 *      private readonly logger: Logger
 * }
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function LoggerInjector<GClass extends Constructor>(target: GClass, _context: ClassDecoratorContext<GClass>): GClass {
    return class extends target {
        constructor(...args: any[]) {
            super(...args);

            const req = require('../../utils/logger');
            this.logger = new req.Logger(new ContextAbstract(target.name));
        }
    };
}
