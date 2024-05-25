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
    newsfeed_url  text NOT NULL COMMENT 'The url of wargaming to get the news of the clan',
    clan_url      text NOT NULL COMMENT 'The wargaming url to the clan page',
    tomato_url    text NOT NULL COMMENT 'The tomato.gg url for the player',
    wargaming_url text NOT NULL COMMENT 'The wargaming url for the player',
    wot_life_url  text NOT NULL COMMENT 'The wot life url for the player'
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

CREATE OR REPLACE TABLE player (
    id   int(3) UNSIGNED AUTO_INCREMENT COMMENT 'The generated id' PRIMARY KEY,
    name varchar(255) NOT NULL COMMENT 'The name of the player'
) COMMENT 'This table manage the trivia player';

CREATE OR REPLACE TABLE tanks (
    id    int(3) UNSIGNED AUTO_INCREMENT COMMENT 'The generated id' PRIMARY KEY,
    name  varchar(255)                 NOT NULL COMMENT 'The name of the tank',
    image varchar(255)                 NOT NULL COMMENT 'The image of the tank',
    ammo  longtext COLLATE utf8mb4_bin NOT NULL COMMENT 'The json representation of the tank ammo'
) COMMENT 'This table manage all the tanks of the trivia game';

CREATE OR REPLACE TABLE trivia (
    id         int(11) UNSIGNED AUTO_INCREMENT COMMENT 'The id of the question'
        PRIMARY KEY,
    tank_id    int(3) UNSIGNED  NOT NULL COMMENT 'The tank id taken from the Tank Table',
    date       datetime         NOT NULL COMMENT 'The date of the Trivia at format YYYY-MM-DD',
    ammo_index tinyint UNSIGNED NULL COMMENT 'The index of the question about the ammo',
    CONSTRAINT trivia_tanks_id_fk
        FOREIGN KEY ( tank_id ) REFERENCES tanks ( id )
            ON UPDATE CASCADE
) COMMENT 'This table manage the question used during the trivia game';

CREATE OR REPLACE TABLE player_answer (
    id           int(11) UNSIGNED AUTO_INCREMENT COMMENT 'The generated id'
        PRIMARY KEY,
    player_id    int(3) UNSIGNED  NOT NULL COMMENT 'The id of the player in the Player table',
    trivia_id    int(11) UNSIGNED NULL COMMENT 'The id of the corresponding question in the trivia table',
    date         datetime         NOT NULL COMMENT 'The date of the Trivia at format yyyy-MM-dd HH:mm:ss',
    right_answer tinyint(1)       NOT NULL COMMENT 'If the answer was a good answer or not',
    answer_time  int(6) UNSIGNED  NULL COMMENT 'The time in millis taken to answer',
    elo          int(6) UNSIGNED  NOT NULL COMMENT 'The elo of the player after each answer',
    CONSTRAINT player_answer_player_id_fk
        FOREIGN KEY ( player_id ) REFERENCES player ( id )
            ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT player_answer_trivia_id_fk
        FOREIGN KEY ( trivia_id ) REFERENCES trivia ( id )
) COMMENT 'This table manage the player answer of the trivia game';

CREATE OR REPLACE INDEX player_answer_trivia_id_index
    ON player_answer ( trivia_id );

CREATE OR REPLACE TABLE potential_clans (
    id int(11) UNSIGNED NOT NULL COMMENT 'The id of the clan'
        PRIMARY KEY
) COMMENT 'This table manage all clans fold from leaving player';

create or replace table trivia_data
(
    max_number_of_question     int                              not null comment 'The max number of question that can be ask per day',
    max_number_of_unique_tanks int                              not null comment 'The max number of tanks before a tank can be redraw',
    max_response_time_limit    int                              not null comment 'The max time to get extra points for good anwser',
    max_duration_of_question   decimal(2, 1)                    not null comment 'The max duration of the question',
    last_tank_page             longtext collate utf8mb4_bin     not null comment 'The list of tanks draw, if a tanks is in the list it can''t be redraw',
    last_date_reduction        date default current_timestamp() not null comment 'The last date when the bot reduce the elo of player'
) comment 'This table store the data for the trivia game';

CREATE OR REPLACE TABLE watch_clans (
    id            int(11) UNSIGNED NOT NULL COMMENT 'The id of the clan' PRIMARY KEY,
    name          text             NOT NULL COMMENT 'The tag of the clan',
    image_url     text             NULL COMMENT 'The url of the image of the clan',
    last_activity text             NULL COMMENT 'The last leaving activity of the clan'
) COMMENT 'This table store all the clan watch for the fold recruitment';

CREATE OR REPLACE TABLE win_streak (
    id        int(11) UNSIGNED AUTO_INCREMENT COMMENT 'The generated id' PRIMARY KEY,
    player_id int(3) UNSIGNED NULL COMMENT 'The id of the player in the Player table',
    date      date            NULL COMMENT 'The date of the Trivia at format YYYY-MM-DD',
    current   int(3) UNSIGNED NOT NULL COMMENT 'The current number of win in a row',
    max       int(3) UNSIGNED NOT NULL COMMENT 'The max number of win in a row',
    CONSTRAINT win_streak_player_id_fk
        FOREIGN KEY ( player_id ) REFERENCES player ( id )
            ON UPDATE CASCADE ON DELETE CASCADE
) COMMENT 'This table store the month win streak of trivia game player';

CREATE OR REPLACE TABLE wot_api (
    id   int(3) UNSIGNED AUTO_INCREMENT COMMENT 'The generated id' PRIMARY KEY,
    name text NOT NULL COMMENT 'The name of the wot api',
    url  text NOT NULL COMMENT 'The url of the wot api'
) COMMENT 'This table store the different wargaming url used by the bot';

CREATE OR REPLACE TABLE crons (
    id   int AUTO_INCREMENT COMMENT 'The generated id'
        PRIMARY KEY,
    name text     NOT NULL COMMENT 'The name of the feature who used the cron',
    cron char(20) NOT NULL COMMENT 'The cron'
) COMMENT 'This table store all the cron used by the bot';