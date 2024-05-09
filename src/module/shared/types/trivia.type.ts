import type { TriviaQuestion } from './table.type';

export type TriviaSelected = { [P in keyof TriviaQuestion]: NonNullable<TriviaQuestion[P]> };
