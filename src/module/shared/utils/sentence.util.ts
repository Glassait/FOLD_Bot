import { ActivityType } from 'discord.js';
import { getRandomNumber } from './random.util';

/**
 * Array containing various statuses along with their activity types.
 * Each element is a double of [{@link ActivityType}, {@link string}].
 */
const status: [ActivityType, string][] = [
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
 * Returns a random status to set the presence of the bot.
 *
 * @returns {[ActivityType, string]} - A tuple containing the activity type and the status message.
 *
 * @example
 * const randomStatus = SentenceUtil.getRandomStatus();
 * console.log(`Activity Type: ${randomStatus[0]}, Status: ${randomStatus[1]}`);
 */
export function getRandomStatus(): [ActivityType, string] {
    return status[getRandomNumber(status.length - 1)];
}
