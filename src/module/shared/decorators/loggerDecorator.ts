import { Logger } from '../classes/logger';
import { Context } from '../classes/context';

type Constructor = { new (...args: any[]): any };

export function LoggerDecorator<T extends Constructor>(base: T): T {
    return class extends base {
        logger: Logger = new Logger(new Context(base.name));
    };
}
