import { Client, Colors, EmbedBuilder, TextChannel } from 'discord.js';
import { InventorySingleton } from '../../shared/singleton/inventory.singleton';
import { Logger } from '../../shared/classes/logger';
import { Context } from '../../shared/classes/context';
import { EmojiEnum } from '../../shared/enums/emoji.enum';
import { TimeUtil } from '../../shared/utils/time.util';

module.exports = async (client: Client): Promise<void> => {
    const logger: Logger = new Logger(new Context('TRIVIA-REMINDER-LOOP'));
    const inventory = InventorySingleton.instance;

    if (!inventory.getFeatureFlipping('trivia')) {
        logger.warn("Trivia feature disabled, if it's normal, dont mind this message!");
        return;
    }

    const channel: TextChannel = await inventory.getChannelForTrivia(client);

    await TimeUtil.forLoopTimeSleep(['20:00'], `${EmojiEnum.LOOP} Trivia reminder`, async (): Promise<void> => {
        await channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`${EmojiEnum.LOOP} Rappel pour le Trivia ${EmojiEnum.LOOP}`)
                    .setColor(Colors.Blue)
                    .setDescription(
                        `Pour ceux qui ne l'on pas encore fait, n'oublier pas de faire au moins une questions aujourd'hui sinon vous risquez de perdre des points. (plus d'info avec la commande \`/trivia rule\`)`
                    ),
            ],
        });
    });
};
