import { type Client } from 'discord.js';
import { TriviaSingleton } from '../../shared/singleton/trivia/trivia.singleton';
import { FeatureFlippingTable } from '../../shared/tables/complexe-table/feature-flipping/feature-flipping.table';
import { asyncThread, thread } from '../../shared/utils/env.util';
import { ScriptModel } from './models/script.model';

module.exports = new ScriptModel('trivia-init', async (client: Client) => {
    const featuresTable: FeatureFlippingTable = new FeatureFlippingTable();

    if (!(await featuresTable.getFeature('trivia'))) {
        return;
    }

    const trivia: TriviaSingleton = TriviaSingleton.instance;

    asyncThread(trivia.createQuestionOfTheDay.bind(trivia));
    thread(async (): Promise<void> => {
        if (!(await trivia.canReduceElo())) {
            return;
        }

        await trivia.sendTriviaResultForYesterday(client);
        await trivia.reduceEloOfInactifPlayer();
    });
});
