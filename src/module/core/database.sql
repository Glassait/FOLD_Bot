CREATE OR REPLACE TABLE ban_words (
    words text NOT NULL COMMENT 'The word to ban from news letter'
) COMMENT 'The table of ban word from the news letter';

CREATE OR REPLACE TABLE blacklisted_players (
    id     int(11) UNSIGNED NOT NULL COMMENT 'The is of the player' PRIMARY KEY,
    name   text             NOT NULL COMMENT 'The name of the player',
    reason text             NOT NULL COMMENT 'The reason of the blacklist'
) COMMENT 'The table of blacklisted player from the fold recruitment';

CREATE OR REPLACE TABLE channels (
    feature_name text NOT NULL COMMENT 'The name of the feature',
    guild_id     text NOT NULL COMMENT 'The guild id',
    channel_id   text NOT NULL COMMENT 'The channel id'
) COMMENT 'The table storing the discord id channel to send message for the corresponding feature';

CREATE OR REPLACE TABLE commands (
    id         int(11) UNSIGNED AUTO_INCREMENT COMMENT 'The generated id' PRIMARY KEY,
    name       text NOT NULL COMMENT 'The command name',
    servers_id text NULL COMMENT 'All the discord id of servers, separate with `,`'
) COMMENT 'The table storing all servers id to register each commands';

CREATE OR REPLACE TABLE feature_flipping (
    id           int(11) UNSIGNED AUTO_INCREMENT COMMENT 'The generated id' PRIMARY KEY,
    name         text                 NOT NULL COMMENT 'The name of the feature',
    is_activated tinyint(1) DEFAULT 0 NOT NULL COMMENT 'Is the feature is activated or not'
) COMMENT 'Table following the feature flipping of each feature of the bot';

CREATE OR REPLACE TABLE fold_recruitment (
    wn8_min             int(6) DEFAULT 1000 NOT NULL COMMENT 'The minimal wn8 needed for the recruitment',
    battles_min         int    DEFAULT 5000 NOT NULL COMMENT 'The minimal amount of battle needed for the recruitment',
    random_min_28       int    DEFAULT 30   NOT NULL COMMENT 'The minimal required number of random battles on the last 28 days',
    fort_sorties_min_28 int    DEFAULT 20   NOT NULL COMMENT 'The minimal required number of fort sorties battles on the last 28 days',
    fort_battles_min_28 int    DEFAULT 10   NOT NULL COMMENT 'The minimal required number of fort battles battles on the last 28 days'
) COMMENT 'This table manage the fold recruitment';

CREATE OR REPLACE TABLE leaving_players (
    id int(11) UNSIGNED NOT NULL COMMENT 'The unique ID of the player' PRIMARY KEY
) COMMENT 'This table store all leaving players detected during fold recruitment';

CREATE OR REPLACE TABLE news_websites (
    id       int(3) UNSIGNED AUTO_INCREMENT COMMENT 'The generated id' PRIMARY KEY,
    live_url text NULL COMMENT 'The main or live url of the site',
    last_url text NOT NULL COMMENT 'The last url fetch for news letter',
    name     text NOT NULL COMMENT 'The name of the site',
    selector text NOT NULL COMMENT 'The selector used to find articles'
) COMMENT 'This table manage the news websites';

CREATE OR REPLACE TABLE potential_clans (
    id int(11) UNSIGNED NOT NULL COMMENT 'The id of the clan'
        PRIMARY KEY
) COMMENT 'This table manage all clans fold from leaving player';

CREATE OR REPLACE TABLE watch_clans (
    id            int(11) UNSIGNED NOT NULL COMMENT 'The id of the clan' PRIMARY KEY,
    name          text             NOT NULL COMMENT 'The tag of the clan',
    image_url     text             NULL COMMENT 'The url of the image of the clan',
    last_activity text             NULL COMMENT 'The last leaving activity of the clan'
) COMMENT 'This table store all the clan watch for the fold recruitment';

CREATE OR REPLACE TABLE crons (
    id   int AUTO_INCREMENT COMMENT 'The generated id'
        PRIMARY KEY,
    name text     NOT NULL COMMENT 'The name of the feature who used the cron',
    cron char(20) NOT NULL COMMENT 'The cron'
) COMMENT 'This table store all the cron used by the bot';