import { InventoryInjector } from '../../../shared/decorators/injector.decorator';
import { InventorySingleton } from '../../../shared/singleton/inventory.singleton';
import { ChannelType, Client, Colors, EmbedBuilder, TextChannel, ThreadAutoArchiveDuration } from 'discord.js';
import { DateUtil } from '../../../shared/utils/date.util';

/**
 * Represents the model for managing monthly announcements and messages in a Discord server.
 */
@InventoryInjector
export class FoldMonthModel {
    //region INJECTOR
    private readonly inventory: InventorySingleton;
    //endregion

    //region PRIVATE FIELDS
    /**
     * The channel to send the messages into.
     */
    private channel: TextChannel;
    //endregion

    /**
     * Fetches the designated channel for monthly announcements.
     *
     * @param {Client} client - The Discord client instance.
     *
     * @example
     * const foldMonthModel = new FoldMonthModel();
     * await foldMonthModel.fetchChannel(client);
     */
    public async fetchChannel(client: Client): Promise<void> {
        this.channel = await this.inventory.getChannelForFoldMonth(client);
    }

    /**
     * Sends monthly announcement messages to the designated channel.
     *
     * @example
     * const foldMonthModel = // Initialize the instance and fetch mandatory
     * await foldMonthModel.sendMessage();
     */
    public async sendMessage(): Promise<void> {
        const embedIntroduction = new EmbedBuilder()
            .setTitle(`Nouveau mois : ${DateUtil.getCurrentMonth()}`)
            .setColor(Colors.LuminousVividPink)
            .setDescription(`Nous souhaitons la bienvenue aux nouveaux membres du clan qui nous ont rejoint le mois dernier ! 🌟`);

        const embedLink = new EmbedBuilder()
            .setTitle('Les outils du clan')
            .setColor(Colors.LuminousVividPink)
            .setDescription(
                'Le clan possède un site internet accessible au lien suivant : https://fold-9cd7648bcbc1.herokuapp.com/accueil ou dans un message épinglé dans ce salon.\nSur le site vous trouverez une liste contenant les chars les plus méta pour la CW ainsi que leurs équipements et compétences\n\nLe clan possède aussi un bot discord :robot:.'
            );

        const embedFeedback = new EmbedBuilder()
            .setTitle('Feedback')
            .setColor(Colors.LuminousVividPink)
            .setDescription(
                "Nous sommes toujours à la recherche de feedback (avis ou retour d'expérience) sur l'organisation du clan ou la qualité de vie, que ça soit sur le discord, le site ou autre. Vous pouvez les mettre dans le fil en dessous.\n\nHésité pas a mettre un :thumbsup: sur les idées que vous trouvez pertinente :)"
            );

        await this.channel.send({
            embeds: [embedIntroduction, embedLink, embedFeedback],
        });

        const thread = await this.channel.threads.create({
            name: 'Feedback et/ou demande',
            type: ChannelType.PublicThread,
            autoArchiveDuration: ThreadAutoArchiveDuration.ThreeDays,
        });

        thread.send({
            content:
                "Dans ce fil vous pouvez mettre tous les feedback (positif ou négatif) ansi que des demandes de nouvelles fonctionnalité ou d'amélioration :)",
        });
    }
}
