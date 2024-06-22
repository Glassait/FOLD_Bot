<style>
.label {
    line-height: 22px;
    padding: 2px 10px;
    border-radius: 2em;
    display: inline-block;
    font-weight: 500;
    white-space: nowrap;
}
.latest {
    color: #3fb950;;
    border: max(1px, 0.0625rem) solid #238636;
}
.pre-release {
    color: #d29922;;
    border: max(1px, 0.0625rem) solid #9e6a03;
}
</style>

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.2.0] - Jun 01, 2024 <span class="label pre-release">Pre-release</span>

### Added

-   Slash-command to get all clan players activity that under a given number of battle
-   Message send to fold recruitment channel that indicated that all api calls failed
-   Message send to fold recruitment channel that show all players ignored
-   Message send when detection of clan from leaving player is done

### Fixed

-   Pipeline to auto upgrade version
-   Trivia result for yesterday when new month
-   Trivia month not send
-   Breaking recruitment loop when tomato api failed
-   Trivia Reminder loop name
-   Leaving player who delete there account
-   Clan-player-activity
    -   Now filter player that are under 30 day in clan
    -   Escape `_` in player name
-   Fix typo in blacklist player when no reason given

## [3.1.1] - Jun 01, 2024 <span class="label latest">Latest</span>

### Changed

-   Multiple modification on fold recruitment :
    -   Now the bot call the tomato api to check the overall wn8 and battle. If criteria are not meet the message is not send
    -   After all message send, the bot check the recent activity for each player wo meet the criteria and update the message with warning when activity is low
-   Maintenance slash-command now takes 2 options : first when the maintenance will start, 2 the duration of the maintenance

### Fixed

-   Real fix of counting game for trivia when player play after midnight

## [3.1.0] - Mai 26, 2024

### Added

-   Maintenance slash-command to annonce the maintenance of the bot
-   Script part:
    -   A script is a function executed only one times at the start of the bot.
    -   The purpose is to remove methode call inside the ready.event because this event sometimes never happens
-   Add more docs on classes

### Changed

-   Changed the format of data storage from JSON to SQL database
-   Now the trivia game use the meta canon of tanks like IS-4 anf BC 25 T
-   Transform all loops with cron
-   Multiple change for `seach-clan`
    -   Rename from `seach-clan` to `detected-clan`
    -   Moved from ready.event to a loop using cron
    -   The message has been enhanced with clan tag and wot life url

### Fixed

-   Now when changing month, the reduced elo of inactif player is set to the correct month
-   The quickest answer now display the right value (before displaying 0)
-   Blacklisted slash-command have now better error managent when Wargaming API send error

## [3.0.0] - Mai 12, 2024

### Added

-   This changelog whit better description
-   More and more markdown + code documentation
-   Eslint for better code style

### Changed

-   Changed the injector to use the new decorator of typescript 5 and update all classes
-   Multiple optimisation
-   Blacklist player directly given in name option are now accepted
-   Rework all imports with `type` when necessary
-   Transform some `import` to `require` for better processing
-   Change the way of writing the event from `export const event` to `modules.exports`

### Fixes

-   Fix the month when changing month
-   Fix the trivia-month by filtering th null
-   Fix the slowest player by sorting the classement

### Removed

-   Fold month message
-   Auto-reply and auto-disconnect slash command

## [2.3.0] - Apr 5, 2024

### Added

-   Add slash command to see list of all observed clans
-   Add leaving player in array
-   The first of the month check all leaving player to get the clan
-   Send trivia message to remind to play
-   Autocomplete for adding / removing blacklisted player
-   Create `CoreFileAbstract` class for all singleton that manage json file
-   Rework json related singleton with CoreFileAbstract to better readability, documentation and efficiency
-   Readme for singleton

### Changed

-   Update trivia rules
-   Reduce playing time for trivia from 1 minute to 30 secondes
-   Disabled the reducing points of trivia player when yesterday tanks not fetch
-   Change the data format of blacklist player to store with ID and not name
-   Extend `FileUtil` with method to check if exist, create folder and readFile

### Fixed

-   Double error in log
-   Fix bug when back-upping json file when backup folder doesn't exist
-   No longer reload server command with empty array

## [2.2.10] - Apr 2, 2024

### Added

-   Discord bot for testing purpose
-   Add the al_capone trophy slash command
-   Reloading slash-command when adding or removing slash-command
-   Blacklist player for fold recruitment

### Changed

-   Rework the trivia game, everything explain here [#138](https://github.com/Glassait/FOLD_Bot/issues/138)
-   Blank the base content of feature.json
-   Put url for fold-recruitment in inventory
-   Transform list of clan for recruitment in object with clan id in properties
-   Rework last activity of clan (moved in feature.json)
-   Optimized `getArrayWithRandomNumber` with set

### Fixed

-   getCommand function with handling error file not found
-   Grammatical error

## [2.2.9] - Mar 10, 2024

### Added

-   Add to git ignore log and backup folder and file
-   Add more caught for error and exception
-   Add Error events handling
-   Add fold month message
-   Automatically backup core files
-   Send message when no player found after the fold recruitment scan
-   Wot express news now show if new is for RU ou EU
-   Wargaming api type
-   `DateUtil` class to manage date related action

### Changed

-   Changed the organisation of inventory
    -   Channels
    -   Feature flipping
-   Name of placeholder enum to be more expressive
-   Update recruitment message by
    -   Changing th wot url with the wargaming url
    -   Adding author to the embed with the clan image
    -   Adding clan name and redirection to the wot portail of the clan
-   More type/method documentation

### Fixed

-   Fix and refactor trivia month messages
-   Fix name of shard-error context
-   Fix last news not found for wot express

### Removed

-   Disabled Trivia game for no player and to many difficulties
-   All part relative to header and footer for recruitment

## [2.2.8] - Feb 25, 2024

### Added

-   Log method now take param to auto put back-quote (code block)
-   Add check when no newsletter website given
-   Add model for watch-clan slash-command
-   Add statistics for fold-recruitment on clan leaving players

### Changed

-   Statistic.json is now blank by default
-   Transform some log to the right level
-   Better md and method documentation

### Fixed

-   Fix clan without last activity
-   Fix index when another tanks are also the right answer
-   Fix timeout axios
-   Fix statistics injector to inject correctly the singleton

### Removed

-   Remove trace log

## [2.2.7] - Feb 10, 2024

### Added

-   Add trace log in error message
-   Add in inventory ban words for news. Check the href of news and potential title
-   Add handling of autocompletion in interaction event
-   More type and method documentation
-   Method to generate schedule for loop in the `TimeUtil` class
-   `/watch-clan remove` command now have autocomplete
-   Watch commands (add/remove) now send message in channel

### Changed

-   Put schedule for fold recruitment in inventory
-   Schedule for loop take hour and minute
-   Big refactor of trivia model
-   `SlashCommandModel` have better handling for option and permission, and autocomplete
-   `/watch-clan remove` now accept name of clan in arguments
-   Error method of Logger now take the error to display/store it

### Fixed

-   French grammar
-   Fix loosing message for trivia game (give right shell, type, special and pen)

### Removed

-   All sequence diagram

## [2.2.6] - Feb 4, 2024

### Added

-   Global error handling
-   Model for trivia month message and new overall statistic
-   More code/type documentation
-   Add gold ammo and penetration to the trivia game
-   Add two hours for the fold recruitment

### Changed

-   Move json to src/module/core folder
-   Update the `BotEvent` type to allow auto-completion
-   Update the event architecture by removing `export default event`, more info
    in [readme](src/module/feature/events/README.md)
-   Removed SPG from trivia game

## [2.2.5] - Jan 22, 2024

### Added

-   Add message of the month for the trivia game

## [2.2.4] - Jan 17, 2024

### Added

-   Trivia game doesn't give same tanks every round
-   Make collector check same answer in trivia game

### Changed

-   Put trivia schedule in inventory
-   Update formula for elo
-   `RandomUtil` generate array of number, with param `allowRepeat` and `forbiden`
-   Refactor foldRecruitment type
-   Axios injector now takes timeout param

### Fixes

-   Fix wording lose trivia
-   Fix replacement when player have id in name

### Removed

-   type number of win_strick

## [2.2.3] - Jan 10, 2024

### Added

-   Add trivia statistics slash-command to visualise the player statistics for each month of participation

### Changed

-   Change win strick type to add current number of win strick and max number of win strick
-   Prettier some file

### Removed

-   `details` tag in md documentation

## [2.2.2] - Jan 9, 2024

### Added

-   Add feature flipping for the header message of clan during the recruitment
-   Add feature flipping for the end message of the recruitment

### Changed

-   Correct all `FoldRecrutement...` to `FoldRecruitment...`

## [2.2.1] - Jan 9, 2024

### Added

-   Add waiting on clan if too much fetch

### Change

-   Rework axios to use more catch
-   Update config for axios
-   Update decorator doc

### Removed

-   Daily bounce from newsletters
-   The maximum date for fold recruitment

## [2.2.0] - Jan 7, 2024

### Added

-   More type for trivia
-   Better trivia message send to player

### Changed

-   Bot now support multi guild
-   Crosspost fold recruitment message to direct message in channel
-   Documentation for slash-command related to multi-guild
-   More dev part

### Fixed

-   Display of top 3 for trivia

### Removed

-   All crosspost related code for fold recruitment

## [2.1.0] - Jan 6, 2024

### Added

-   Multiple part for the clan watching to detect leaving player (name gold-recruitment)
    -   Slash-command
    -   Message
    -   Feature property
    -   Inventory property
-   Sleep when sending news to not spam the channel
-   Crosspost message from free puntos discord to fold discord change when leaving player detected

### Changed

-   Documentation for slash-command
-   Documentation in singleton
-   Moved all emoji in an Enum

## [2.0.1] - Jan 5, 2024

### Added

-   Add more logs
-   Emoji on logs
-   Time Enum and Util

### Changed

-   Rework loop in trivia game
-   Set trivia game time to 5 min and add countdown
-   Trivia game only send to 18h30, 19h30 and 20h30
-   Trivia documentation

### Fixed

-   Fix date in trivia game

## [2.0.0] - Jan 4, 2024

### Added

-   Create changelog in base readme.md
-   Create the trivia game
-   Dev environments
-   Loop related code
-   Singleton injector decorator
-   Util classes

### Changed

-   Better prettier conf
-   Update dependencies
-   Prettier md documentation
-   Clean code

## [1.2.1] - Dec 18, 2023

### Changed

-   Move file to there optimal position to respect the module/feature and module/shared design
-   Update documentation
-   Optimise/Simplify the SlashCommandModel class and all slash-commands

### Fixes

-   Fix log in singleton class

## [1.2.0] - Dec 17, 2023

### Added

-   Add GitHub issues/feature template
-   Create logger decorator
-   Create logger class to simply the use of log method

### Changed

-   Update dependency
-   Update prettier conf
-   Update sequence diagrams for Auto-reply
-   Update logic of Auto-reply
-   Update documentation

## [1.1.1] - Dec 8, 2023

### Fixed

-   Fix readme

## [1.1.0] - Dec 8, 2023

### Added

-   Bot logo
-   Create new sequence diagrams and update existing one

### Changed

-   Rewrite all the documentations about the projet in readme and code
-   Used a new architecture in module/feature and module/shared

## [1.0.5] - Dec 3, 2023

### Added

-   Add more log for error

### Changed

-   Update sequence diagrams
-   Better error log

### Removed

-   Remove SendUtils class

## [1.0.4] - Dec 2, 2023

### Added

-   Create new sequence diagrams

### Changed

-   Update and optimise log class
-   Optimise feature class
-   Update global log

## [1.0.3] - Dec 1, 2023

### Added

-   More log in
    -   event
    -   handler
    -   singleton
-   More md documentation

### Fixed

-   Wot Express newsletter

## [1.0.2] - Nov 30, 2023

### Changed

-   Update dependency

## [1.0.1] - Nov 30, 2023

### Added

-   Projet creation
-   Base architecture
    -   Logger
    -   News letter + Dev + Logger
-   Slash-command
    -   Auto disconnect feature
    -   Auto replay
-   Handler
-   Events
-   CI
    -   Auto release

### Fixed

-   Fix package.json
-   Fix package
-   Error scrap armored patrol

---

[3.2.0]: https://github.com/Glassait/FOLD_Bot/compare/v3.1.1-1...v3.2.0-10
[3.1.1]: https://github.com/Glassait/FOLD_Bot/compare/v3.1.0-10...v3.1.1-1
[3.1.0]: https://github.com/Glassait/FOLD_Bot/compare/v3.0.0-2...v3.1.0-10
[3.0.0]: https://github.com/Glassait/FOLD_Bot/compare/v2.3.0-6...v3.0.0-2
[2.3.0]: https://github.com/Glassait/FOLD_Bot/compare/v2.2.10-6...v2.3.0-5
[2.2.10]: https://github.com/Glassait/FOLD_Bot/compare/v2.2.9-8...v2.2.10-6
[2.2.9]: https://github.com/Glassait/FOLD_Bot/compare/v2.2.8-4...v2.2.9-8
[2.2.8]: https://github.com/Glassait/FOLD_Bot/compare/v2.2.7-8...v2.2.8-4
[2.2.7]: https://github.com/Glassait/FOLD_Bot/compare/v2.2.6-5...v2.2.7-8
[2.2.6]: https://github.com/Glassait/FOLD_Bot/compare/v2.2.5-0...v2.2.6-5
[2.2.5]: https://github.com/Glassait/FOLD_Bot/compare/v2.2.4-3...v2.2.5-0
[2.2.4]: https://github.com/Glassait/FOLD_Bot/compare/v2.2.3-0...v2.2.4-3
[2.2.3]: https://github.com/Glassait/FOLD_Bot/compare/v2.2.2-0...v2.2.3-0
[2.2.2]: https://github.com/Glassait/FOLD_Bot/compare/v2.2.1-3...v2.2.2-0
[2.2.1]: https://github.com/Glassait/FOLD_Bot/compare/v2.2.0-1...v2.2.1-3
[2.2.0]: https://github.com/Glassait/FOLD_Bot/compare/v2.1.0-9...v2.2.0-1
[2.1.0]: https://github.com/Glassait/FOLD_Bot/compare/v2.0.1-1...v2.1.0-9
[2.0.1]: https://github.com/Glassait/FOLD_Bot/compare/v2.0.0-4...v2.0.1-1
[2.0.0]: https://github.com/Glassait/FOLD_Bot/compare/v1.2.1...v2.0.0-4
[1.2.1]: https://github.com/Glassait/FOLD_Bot/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/Glassait/FOLD_Bot/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/Glassait/FOLD_Bot/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/Glassait/FOLD_Bot/compare/v1.0.5...v1.1.0
[1.0.5]: https://github.com/Glassait/FOLD_Bot/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/Glassait/FOLD_Bot/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/Glassait/FOLD_Bot/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/Glassait/FOLD_Bot/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/Glassait/FOLD_Bot/commits/v1.0.1
