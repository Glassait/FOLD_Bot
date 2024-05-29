import type { Constructor } from './models/injector.type';
import { ChannelsTable } from '../../tables/complexe-table/channels/channels.table';
import { FeatureFlippingTable } from '../../tables/complexe-table/feature-flipping/feature-flipping.table';
import { WinStreakTable } from '../../tables/complexe-table/win-streak/win-streak.table';
import { TriviaTable } from '../../tables/complexe-table/trivia/trivia.table';
import { CommandsTable } from '../../tables/complexe-table/commands/commands.table';
import { WatchClansTable } from '../../tables/complexe-table/watch-clans/watch-clans.table';
import { BlacklistedPlayersTable } from '../../tables/complexe-table/blacklisted-players/blacklisted-players.table';
import { LeavingPlayersTable } from '../../tables/complexe-table/leaving-players/leaving-players.table';
import { PotentialClansTable } from '../../tables/simple-table/potential-clans.table';
import { FoldRecruitmentTable } from '../../tables/simple-table/fold-recruitment.table';
import { NewsWebsitesTable } from '../../tables/complexe-table/news-websites/news-websites.table';
import { BanWordsTable } from '../../tables/simple-table/ban-words.table';
import { TriviaDataTable } from '../../tables/complexe-table/trivia-data/trivia-data.table';
import { TanksTable } from '../../tables/complexe-table/tanks/tanks.table';
import { PlayersTable } from '../../tables/complexe-table/players/players.table';
import { PlayersAnswersTable } from '../../tables/complexe-table/players-answers/players-answers.table';

let tableMap: {
    // Commons
    Channels: Constructor<ChannelsTable>;
    FeatureFlipping: Constructor<FeatureFlippingTable>;
    Commands: Constructor<CommandsTable>;
    // Fold Recruitment
    WatchClans: Constructor<WatchClansTable>;
    BlacklistedPlayers: Constructor<BlacklistedPlayersTable>;
    LeavingPlayers: Constructor<LeavingPlayersTable>;
    PotentialClans: Constructor<PotentialClansTable>;
    FoldRecruitment: Constructor<FoldRecruitmentTable>;
    // Newsletter
    NewsWebsites: Constructor<NewsWebsitesTable>;
    BanWords: Constructor<BanWordsTable>;
    // Trivia game
    TriviaData: Constructor<TriviaDataTable>;
    Tanks: Constructor<TanksTable>;
    Players: Constructor<PlayersTable>;
    PlayersAnswer: Constructor<PlayersAnswersTable>;
    Trivia: Constructor<TriviaTable>;
    WinStreak: Constructor<WinStreakTable>;
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
            Channels: ChannelsTable,
            FeatureFlipping: FeatureFlippingTable,
            Commands: CommandsTable,
            // Fold Recruitment
            WatchClans: WatchClansTable,
            BlacklistedPlayers: BlacklistedPlayersTable,
            LeavingPlayers: LeavingPlayersTable,
            PotentialClans: PotentialClansTable,
            FoldRecruitment: FoldRecruitmentTable,
            // Newsletter
            NewsWebsites: NewsWebsitesTable,
            BanWords: BanWordsTable,
            // Trivia game
            TriviaData: TriviaDataTable,
            Tanks: TanksTable,
            Players: PlayersTable,
            PlayersAnswer: PlayersAnswersTable,
            Trivia: TriviaTable,
            WinStreak: WinStreakTable,
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return function actual<GTable>(_target: GTable, _context: ClassFieldDecoratorContext<GTable>) {
        return function (this: GTable, field: unknown) {
            const req = tableMap[dependence];

            if (!req) {
                throw new Error(`Unsupported dependence type: ${dependence}`);
            }

            field = new req(); // NOSONAR
            return field;
        };
    };
}
