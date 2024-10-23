import type { Constructor } from './models/injector.type';
import { ChannelsTable } from 'tables/complexe-table/channels/channels.table';
import { FeatureFlippingTable } from 'tables/complexe-table/feature-flipping/feature-flipping.table';
import { CommandsTable } from 'tables/complexe-table/commands/commands.table';
import { WatchClansTable } from 'tables/complexe-table/watch-clans/watch-clans.table';
import { BlacklistedPlayersTable } from 'tables/complexe-table/blacklisted-players/blacklisted-players.table';
import { LeavingPlayersTable } from 'tables/complexe-table/leaving-players/leaving-players.table';
import { PotentialClansTable } from 'tables/simple-table/potential-clans.table';
import { FoldRecruitmentTable } from 'tables/simple-table/fold-recruitment.table';
import { NewsWebsitesTable } from 'tables/complexe-table/news-websites/news-websites.table';
import { BanWordsTable } from 'tables/simple-table/ban-words.table';
import { WotNewsTable } from 'tables/complexe-table/wot-news/wot-news.table';

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
    WotNews: Constructor<WotNewsTable>;
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
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
            WotNews: WotNewsTable,
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return function actual<GTable>(_target: GTable, _context: ClassFieldDecoratorContext<GTable>) {
        return function (this: GTable, field: unknown) {
            field = new tableMap![dependence](); // NOSONAR
            return field;
        };
    };
}
