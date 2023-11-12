import { Collection } from 'discord.js';
import { DiscordId } from '../types/feature.type';

export class ResponseUtils {
    private static response: Collection<number, string> = new Collection([
        [1, 'Évolue un peu <@discordId> !'],
        [2, '<@discordId> pourquoi ne pas réfléchir un peu plus avant de poser des questions ?'],
        [
            3,
            'Tout le monde peut faire des erreurs, mais les tiennes <@discordId> sont assez spéciales.',
        ],
        [4, 'As-tu déjà essayé de comprendre les choses par toi-même <@discordId> ?'],
        [5, 'Intéressant <@discordId>, tu as réussi à trouver la solution la plus compliquée.'],
        [6, 'Bravo <@discordId>, tu viens de perdre une occasion de te taire.'],
        [7, '<@discordId> tu es vraiment doué pour dire des évidences.'],
        [
            8,
            "Si seulement tu pouvais être aussi rapide que tu l'es pour dire des bêtises <@discordId>.",
        ],
        [9, 'De façon polie <@discordId>, tais-toi !'],
        [10, 'Mais ta gueule <@discordId> !'],
        [11, 'Juste TG <@discordId> !'],
    ]);

    public static getRandomResponse(id: DiscordId): string {
        let response: string | undefined = this.response.random();

        while (!response) {
            response = this.response.random();
        }

        return response.replace('discordId', id);
    }
}
