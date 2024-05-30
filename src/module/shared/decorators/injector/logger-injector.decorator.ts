import { ContextAbstract } from '../../abstracts/context.abstract';
import type { Constructor } from './models/injector.type';
import { Logger } from '../../utils/logger';

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
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
export function LoggerInjector<GClass extends Constructor<any>>(target: GClass, _context: ClassDecoratorContext<GClass>): GClass {
    return class extends target {
        constructor(...args: any[]) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            super(...args);
            this.logger = new Logger(new ContextAbstract(target.name));
        }
    };
}
