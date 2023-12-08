import { ActivityType } from 'discord.js';
import { DiscordId } from '../types/feature.type';
import { EnvUtil } from './env.util';

export class SentenceUtil {
    private static response: string[] = [
        'Évolue un peu <@discordId> !',
        '<@discordId> pourquoi ne pas réfléchir un peu plus avant de poser des questions ?',
        'Tout le monde peut faire des erreurs, mais les tiennes <@discordId> sont assez spéciales.',
        'As-tu déjà essayé de comprendre les choses par toi-même <@discordId> ?',
        'Intéressant <@discordId>, tu as réussi à trouver la solution la plus compliquée.',
        'Bravo <@discordId>, tu viens de perdre une occasion de te taire.',
        '<@discordId> tu es vraiment doué pour dire des évidences.',
        "Si seulement tu pouvais être aussi rapide que tu l'es pour dire des bêtises <@discordId>.",
        'De façon polie <@discordId>, tais-toi !',
        'Mais ta gueule <@discordId> !',
        'Juste TG <@discordId> !',
        "<@discordId> t'as pas fini de brill… non, en fait, oublie.",
        "<@discordId> génie incompris, comme d'hab.",
        "Quelle surprise <@discordId>, tu dis quelque chose d'inutile.",
        "J'espère que ça t'a demandé beaucoup d'effort intellectuel <@discordId>.",
        'Tu veux un trophée pour ton intelligence exceptionnelle <@discordId> ?',
        "<@discordId> c'est incroyable à quel point t'es insupportable.",
        '<@discordId>, vas-y, continue de parler pour rien dire.',
        "Wow, <@discordId>, t'as dû te surpasser pour sortir une telle bêtise.",
        "C'est impressionnant, <@discordId>, à quel point tu me fais perdre mon temps.",
        '<@discordId>, si seulement tu pouvais te taire un peu plus souvent.',
        "<@discordId>, j'ai connu des idées plus brillantes venant de gamins de maternelle.",
        "<@discordId> va demander à GPT de t'apprendre à te taire.",
    ];
    private static status = [
        [ActivityType.Playing, 'Imagine un monde sans Bady'],
        [ActivityType.Playing, 'Imagine un monde sans Jeff'],
        [ActivityType.Listening, 'Jeff dire de la merde h24'],
        [ActivityType.Listening, 'Bady mentir à longueur de journée'],
        [ActivityType.Listening, 'Amiral rager'],
        [ActivityType.Listening, "Le silence quand Amiral n'est pas la"],
        [ActivityType.Watching, 'Wargaming créer un nouveau tier 8 russe'],
        [ActivityType.Watching, 'Un bot contre un bot'],
    ];

    public static getRandomResponse(id: DiscordId): string {
        return this.response[this.getRandomNumber(this.response.length)].replace('discordId', id);
    }

    public static getRandomStatus(): any {
        return EnvUtil.isDev() ? [ActivityType.Custom, 'Entrain de ce faire toucher le code'] : this.status[this.getRandomNumber(this.status.length)];
    }

    private static getRandomNumber(max?: number): number {
        max = max || 1;
        return Math.floor(Math.random() * max);
    }
}
