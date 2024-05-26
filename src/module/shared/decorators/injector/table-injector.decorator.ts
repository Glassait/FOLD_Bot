import type { Constructor } from './models/injector.type';

let tableMap: {
    // Commons
    Channels: Constructor;
    FeatureFlipping: Constructor;
    Commands: Constructor;
    // Fold Recruitment
    WatchClans: Constructor;
    BlacklistedPlayers: Constructor;
    LeavingPlayers: Constructor;
    PotentialClans: Constructor;
    FoldRecruitment: Constructor;
    // Newsletter
    NewsWebsites: Constructor;
    BanWords: Constructor;
    // Trivia game
    TriviaData: Constructor;
    Tanks: Constructor;
    Players: Constructor;
    PlayersAnswer: Constructor;
    Trivia: Constructor;
    WinStreak: Constructor;
};

/**
 * Decorator function to inject table instances based on the provided dependence type.
 *
 * @param {keyof typeof tableMap} dependence - The type of dependence to inject.
 *
 * @returns {Function} - Decorator function.
 *
 * @throws {Error} - Throws an error if an unsupported dependence type is provided.
 *
 * @example
 * .@Injectable("WatchClans") private readonly watchClansTable: WatchClanTable;
 */
export function Table(
    dependence: keyof typeof tableMap
    // eslint-disable-next-line @typescript-eslint/ban-types
): Function {
    if (!tableMap) {
        tableMap = {
            // Commons
            Channels: require('../../tables/complexe-table/channels/channels.table').ChannelsTable,
            FeatureFlipping: require('../../tables/complexe-table/feature-flipping/feature-flipping.table').FeatureFlippingTable,
            Commands: require('../../tables/complexe-table/commands/commands.table').CommandsTable,
            // Fold Recruitment
            WatchClans: require('../../tables/complexe-table/watch-clans/watch-clans.table').WatchClansTable,
            BlacklistedPlayers: require('../../tables/complexe-table/blacklisted-players/blacklisted-players.table')
                .BlacklistedPlayersTable,
            LeavingPlayers: require('../../tables/complexe-table/leaving-players/leaving-players.table').LeavingPlayersTable,
            PotentialClans: require('../../tables/simple-table/potential-clans.table').PotentialClansTable,
            FoldRecruitment: require('../../tables/simple-table/fold-recruitment.table').FoldRecruitmentTable,
            // Newsletter
            NewsWebsites: require('../../tables/complexe-table/news-websites/news-websites.table').NewsWebsitesTable,
            BanWords: require('../../tables/simple-table/ban-words.table').BanWordsTable,
            // Trivia game
            TriviaData: require('../../tables/complexe-table/trivia-data/trivia-data.table').TriviaDataTable,
            Tanks: require('../../tables/complexe-table/tanks/tanks.table').TanksTable,
            Players: require('../../tables/complexe-table/players/players.table').PlayersTable,
            PlayersAnswer: require('../../tables/complexe-table/players-answers/players-answers.table').PlayersAnswersTable,
            Trivia: require('../../tables/complexe-table/trivia/trivia.table').TriviaTable,
            WinStreak: require('../../tables/complexe-table/win-streak/win-streak.table').WinStreakTable,
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return function actual<GTable>(_target: GTable, _context: ClassFieldDecoratorContext<GTable, any>) {
        return function (this: GTable, field: any) {
            const req: Constructor = tableMap[dependence];

            if (!req) {
                throw new Error(`Unsupported dependence type: ${dependence}`);
            }

            field = new req(); // NOSONAR
            return field;
        };
    };
}
