import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { SlashCommandModel } from './model/slash-command.model';
import { TriviaModel } from './model/trivia.model';
import { InventorySingleton } from '../../shared/singleton/inventory.singleton';
import { DateUtil } from '../../shared/utils/date.util';

const MAPPING = {
    STATISTICS: {
        name: 'statistics',
    },
    SCOREBOARD: {
        name: 'scoreboard',
    },
    GAME: {
        name: 'game',
    },
    RULE: {
        name: 'rule',
    },
};
const trivia = new TriviaModel();
trivia.initialize();

export const command: SlashCommandModel = new SlashCommandModel(
    'trivia',
    'Commande concernant le jeu trivia',
    async (interaction: ChatInputCommandInteraction): Promise<void> => {
        await interaction.deferReply({ ephemeral: true });

        if (!InventorySingleton.instance.getFeatureFlipping('trivia')) {
            await interaction.editReply({
                content: "Le jeu trivia n'est pas activé par l'administrateur <@313006042340524033>.",
            });
            return;
        }

        if (interaction.options.getSubcommand() === MAPPING.STATISTICS.name) {
            await trivia.sendStatistics(interaction);
        } else if (interaction.options.getSubcommand() === MAPPING.GAME.name) {
            await trivia.sendGame(interaction);
        } else if (interaction.options.getSubcommand() === MAPPING.SCOREBOARD.name) {
            await trivia.sendScoreboard(interaction);
        } else if (interaction.options.getSubcommand() === MAPPING.RULE.name) {
            await trivia.sendRule(interaction);
        }
    },
    {
        option: [
            new SlashCommandSubcommandBuilder()
                .setName(MAPPING.GAME.name)
                .setDescription(
                    `Jouer au jeu trivia et apprenez les alpha des tier 10 (maximum ${InventorySingleton.instance.trivia.max_number_of_question} par jour)`
                ),
            new SlashCommandSubcommandBuilder()
                .setName(MAPPING.STATISTICS.name)
                .setDescription('Visualiser-vos statistiques sur le jeu trivia'),
            new SlashCommandSubcommandBuilder()
                .setName(MAPPING.SCOREBOARD.name)
                .setDescription(`Visualiser le scoreboard du mois de \`${DateUtil.getCurrentMonth()}\` pour le jeu trivia`),
            new SlashCommandSubcommandBuilder().setName(MAPPING.RULE.name).setDescription('Lire les règle du jeu trivia'),
        ],
    }
);
