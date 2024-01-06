import { ActivityType } from 'discord.js';
import { DiscordId } from '../types/feature.type';
import { EnvUtil } from './env.util';
import { RandomUtil } from './random.util';

/**
 * Utils for sentence
 */
export class SentenceUtil {
    private static response_old: string[] = [
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
    private static response: string[] = [
        'Arrête de ping pour rien et évolue un peu <@discordId> !',
        'Évite de mentionner sans raison et progresse un peu <@discordId> !',
        'De manière polie <@discordId>, tais-toi !',
        'Mais ta gueule <@discordId> !',
        'Juste TG <@discordId> !',
        "As-tu dû déployer beaucoup d'efforts intellectuels, <@discordId>, pour simplement faire une mention ?",
        "Eh bien, <@discordId>, as-tu du mal à construire des phrases ? Je t'invite à consulter ce site : https://dictionnaire.lerobert.com/guide/qu-est-ce-qu-une-phrase#:~:text=Une%20phrase%20est%20constitu%C3%A9e%20d,les%20r%C3%A8gles%20de%20la%20grammaire.",
        "C'est impressionnant <@discordId>, à quel point tu me fais perdre mon temps !",
        "Tu imagines l'énergie que ça m'a pris, <@discordId>, pour te renvoyer cette réponse ?",
        'Tu devrais recevoir un trophée, <@discordId> !',
        "Si c'est pour faire une simple mention, <@discordId>, tu aurais pu demander à GPT de t'écrire la phrase !",
        'Même GPT-1 sais faire des phrases, alors pourquoi pas toi, <@discordId> ?',
        "Même au CP, on maîtrise la construction de phrases, mais <@discordId>, tu semblais avoir d'autres priorités.",
        '<@discordId>',
        'Moi aussi de peux ping, <@discordId>',
    ];
    private static status: [ActivityType, string][] = [
        [ActivityType.Playing, 'imaginer un monde sans Bady'],
        [ActivityType.Playing, 'imaginer un monde sans Jeff'],
        [ActivityType.Playing, 'WoT avec une arty en 2018'],
        [ActivityType.Listening, 'Jeff dire de la merde h24'],
        [ActivityType.Listening, 'Bady mentir à longueur de journée'],
        [ActivityType.Listening, 'Amiral rager'],
        [ActivityType.Listening, "le silence quand Amiral n'est pas la"],
        [ActivityType.Listening, 'Comme un Rock !'],
        [ActivityType.Watching, 'Wargaming créer un nouveau tier 8 russe'],
        [ActivityType.Watching, 'un bot contre un bot'],
        [ActivityType.Watching, 'la HE des 60TP de 2021 sur les Chieftain'],
        [ActivityType.Watching, 'des artys tirant avec des AP'],
        [ActivityType.Watching, 'un réacteur nucléaire en pleine fusion'],
        [ActivityType.Competing, 'Dominer le monde avec GPT'],
        [ActivityType.Custom, 'Inchabouda'],
    ];

    /**
     * Return a random response in the array
     * @param id The id to put in the response
     */
    public static getRandomResponse(id: DiscordId): string {
        return this.response[RandomUtil.getRandomNumber(this.response.length - 1)].replace('discordId', id);
    }

    /**
     * Return a random status to set the presence of the bit
     */
    public static getRandomStatus(): any {
        return EnvUtil.isDev()
            ? [ActivityType.Custom, 'Entrain de ce faire toucher le code']
            : this.status[RandomUtil.getRandomNumber(this.status.length - 1)];
    }
}
