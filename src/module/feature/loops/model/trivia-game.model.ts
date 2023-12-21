import { LoggerInjector } from '../../../shared/decorators/injector.decorator';

@LoggerInjector
export class TriviaGameModel {
    private readonly MAX_TIME: number = 1000 * 60;
    private readonly lo;
}
