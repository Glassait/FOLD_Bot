import type { TriviaQuestion, TriviaRaw } from './trivia.type';

export class TriviaMapper {
    public static transformArrayTriviaRawInArrayTriviaQuestion(raws: TriviaRaw[]): TriviaQuestion[] {
        return raws.reduce((questions: TriviaQuestion[], raw: TriviaRaw): TriviaQuestion[] => {
            questions.push(this.transformTriviaRawInTriviaQuestion(raw));
            return questions;
        }, []);
    }

    public static transformTriviaRawInTriviaQuestion(raw: TriviaRaw): TriviaQuestion {
        return {
            id: raw.id,
            ammoIndex: raw.ammo_index,
            tank: {
                id: raw.tank_id,
                ammo: JSON.parse(raw.ammo),
                image: raw.image,
                name: raw.name,
            },
        };
    }
}
