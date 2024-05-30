import { EmojiEnum } from '../../../shared/enums/emoji.enum';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type ChatInputCommandInteraction, Colors, EmbedBuilder } from 'discord.js';
import { ShellEnum } from '../enums/shell.enum';

export class TriviaExampleModel {
    //region PRIVATE READONLY FIELDS
    /**
     * Embed containing all the information for the rule command
     */
    private readonly embedRule: EmbedBuilder = new EmbedBuilder()
        .setColor(Colors.Orange)
        .setTitle('Voici les règles concernant le jeu trivia V2.1')
        .setThumbnail(
            'https://img.poki.com/cdn-cgi/image/quality=78,width=600,height=600,fit=cover,f=auto/8fe1b52b0dce26510d0ebf4cbb484aaf.png'
        )
        .setFields(
            {
                name: 'But',
                value: "Ce jeu vise à t'aider à mémoriser les dégâts moyens et le type d'obus des chars de rang 10 dans World of Tanks.",
            },
            {
                name: 'Commande',
                value: "Le jeu `trivia` peut-être lancé avec la commande `/trivia game` dans n'importe quel salon textuel. Toutefois, il ne peut pas être lancé que `4 fois par jour`. Lorsque tu démarres un trivia, le bot t'envoie un message visible uniquement par toi contenant les informations suivantes :",
            },
            {
                name: 'Obus',
                value: `Affichant son \`type\` (AP, APCR, etc) et son \`dégât moyen (alpha)\`, l'obus peut être un obus \`standard\` ou un obus \`spécial\` (dit gold). **${EmojiEnum.WARNING} Depuis la V2.1, le bot récupère le canon dit 'méta' des chars. Cependant, il n'utilise qu'un seul canon, donc faites attention au char comme le E-100 ou c'est le premier canon qui est sélectionné !**`,
            },
            {
                name: 'Minuteur',
                value: `Tu as \`30 secondes\` pour répondre à la question. À la fin du minuteur, le bot t'enverra ton résultat : bonne ou mauvaise réponse ainsi que les informations sur le char à trouver et sur le char que tu as sélectionné.\n\nLorsque tu répond à la question en moins de \`10 secondes\`, tu obtiens un bonus de \`25%\` sur les points obtenus en cas de bonne réponse. ${EmojiEnum.WARNING} **Le temps de réponse change si tu sélectionnes une autre réponse !**`,
            },
            {
                name: 'Bouton',
                value: `Le message sera suivi de \`quatre boutons cliquables\`. Chaque bouton représente un char rang 10 sélectionné aléatoirement. Pour répondre, il te suffit de cliquer sur l'un des boutons. Tu peux changer de réponse tant que le minuteur n'est pas terminé. **${EmojiEnum.WARNING} ️Quand 2 ou plusieurs chars ont le même obus (type et alpha), tous ces chars sont considérés comme la réponse.**`,
            },
            {
                name: 'Sommaire',
                value: 'Tous les jours, au lancement du bot, un sommaire sera envoyé. Il contient le top 3 des joueurs pour chaque question en terme de vitesse de réponse, ainsi que la bonne réponse et des informations sur les autres chars.',
            },
            {
                name: 'AFK',
                value: "En cas d'absence de jeu pendant une journée, une perte de `1.8% de vos points` sera appliquée.",
            },
            {
                name: 'Valeur',
                value: `${EmojiEnum.WARNING} Les valeurs indiquées dans les paragraphes précédent peuvent être modifiées sans avoir été mis à jour dans le texte. Une communication pourra être fais dans ce cas la !`,
            }
        );

    /**
     * Embed use as exemple for the rule command
     */
    private readonly embedExample: EmbedBuilder = new EmbedBuilder()
        .setTitle('Example de question')
        .setDescription("Dans cette exemple, les boutons sont clickable mais aucune logique n'est implémentée !")
        .setColor(Colors.Blurple)
        .setFields(
            {
                name: 'Obus :',
                value: `\`${ShellEnum.ARMOR_PIERCING} 390\``,
                inline: true,
            },
            {
                name: 'Minuteur :',
                value: 'Le temps sera ici',
                inline: true,
            }
        );

    /**
     * The row builder for the example
     */
    private readonly rowExample: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(new ButtonBuilder().setCustomId('Object 140').setLabel('Object 140').setStyle(ButtonStyle.Primary))
        .addComponents(new ButtonBuilder().setCustomId('Manticore').setLabel('Manticore').setStyle(ButtonStyle.Primary))
        .addComponents(new ButtonBuilder().setCustomId('Object 268').setLabel('Object 268').setStyle(ButtonStyle.Primary))
        .addComponents(new ButtonBuilder().setCustomId('Object 907').setLabel('Object 907').setStyle(ButtonStyle.Primary));
    //endregion

    /**
     * Callback for the rule commande, send the rule to the player in ephemeral message
     *
     * @param {ChatInputCommandInteraction} interaction - The chat interaction of the player
     */
    public async sendRule(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.editReply({ embeds: [this.embedRule, this.embedExample], components: [this.rowExample] });
    }
}
