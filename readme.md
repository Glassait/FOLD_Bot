![GitHub issues by-label](https://img.shields.io/github/issues/Glassait/freePuntosBot/enhancement?logo=github&color=green&style=for-the-badge)
![GitHub issues by-label](https://img.shields.io/github/issues/Glassait/freePuntosBot/bug?logo=github&color=red&style=for-the-badge)
![GitHub closed issues](https://img.shields.io/github/issues-closed/Glassait/freePuntosBot?logo=github&color=open&style=for-the-badge&link=https%3A%2F%2Fgithub.com%2FGlassait%2FfreePuntosBot%2Fissues)
![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/Glassait/freePuntosBot/main?style=for-the-badge)
![GitHub commit activity (branch)](https://img.shields.io/github/commit-activity/m/Glassait/freePuntosBot?logo=github&style=for-the-badge)
![GitHub contributors](https://img.shields.io/github/contributors/Glassait/freePuntosBot?logo=github&style=for-the-badge&color=purple)

<header style="display: flex; align-items: center; flex-direction: column">
<img src="logo.png" alt="free puntos logo" width="300" height="auto">

# <h1>Free Puntos Bot</h1>

<div>
<a href="https://github.com/Glassait/freePuntosBot/issues">Report bug</a> · <a href="https://github.com/Glassait/freePuntosBot/issues">Request feature</a>
</div>
</header>

---

## 🛠️ Languages and Tools 🛠️

<div style="display: flex; gap: 1rem;; align-items: center">
    <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" width="100" height="auto" alt="Typescript">
    <img src="https://discord.js.org/static/logo.svg" width="200" alt="discord.js">
</div>
<br>

---

## Getting Started

You will find below all the informations for the installation of the project in local.

### Prerequisites

This project need node v18.16.0 or higher

1. If you use Node Version Manager
    ```sh
    nvm install 18.16.0
    ```
2. Else download and install it from [nodejs.org](https://nodejs.org/dist/v18.16.0/)

### Installation

1. Clone the repo
    ```sh
    git clone https://github.com/Glassait/freePuntosBot
    ```
2. Install NPM packages
    ```sh
    npm install
    ```
3. Contact me on discord to get the token for the bot
4. If you want to test the bot run ce following command :
    ```sh
     npm run start:mock
    ```
    <br>

---

## Roadmap

-   [x] Better handle of overall error
-   [ ] Make trivia games uses the second canon on tanks that have multiple canon
-   [ ] Used chained catch to better handle

See the [open issues](https://github.com/Glassait/freePuntosBot/issues?q=is%3Aopen+is%3Aissue+label%3Aenhancement) for a full list of proposed features (and known issues).
<br>

---

## Contributing

Before creating an issue, please ensure that it hasn't already been reported/suggested, and double-check the documentation.
See the contribution guide if you'd like to submit a PR.

Don't forget to update all the readme and the sequence diagram.
<br>

---

## Acknowledgments

Use this space to list resources you find helpful and would like to give credit to. I've included a few of my favorites to kick things off!

-   [Badge Shields](https://shields.io)
-   [Readme template](https://github.com/othneildrew/Best-README-Template/blob/master/README.md?plain=1)

## Changelog

### 2.2.7

-   Method to generate schedule for loop ([forLoopTimeSleep](src/module/shared/utils/time.util.ts))
-   Add schedule for fold recruitment
-   Schedule for loop take hour and minute
-   [Command watch clan](src/module/feature/slash-commands/watch-clan.slash-command.ts) remove now accept name of clan in addition of id
-   Watch commands (add/remove) now send message in channel
-   Add in inventory ban words for news. Check the href of news and
-   Fix loosing message for trivia game (give right shell, type, special and pen)

### 2.2.6

-   Add two hours for the fold recruitment
-   Update the [BotEvent](src/module/feature/events/types/bot-event.type.ts) type to allow auto-completion
-   Update the event architecture by removing `export default event`, more info in [readme](src/module/feature/events/readme.md)
-   Move json to [core](src/module/core)
-   Removed SPG from trivia game
-   Model for trivia month message and new overall statistic
-   Add gold ammo and penetration to the trivia game

### 2.2.5

-   Add message of the month for the trivia game ([ready.event](src/module/feature/events/ready.event.ts))

### 2.2.4

-   Put trivia schedule in inventory
-   Fix wording lose trivia
-   Make collector check same answer in trivia game
-   Update formula for elo
-   Fix replacement when player have id in name
-   Trivia game doesn't give same tanks every round

### 2.2.3

-   Add trivia statistics command to visualise the player statistics for each month of participation
-   Change win strick type to add current number of win strick and max number of win strick

### 2.2.2

-   Add feature flipping for the header message of clan during the recruitment
-   Add feature flipping for the end message of the recruitment

### 2.2.1

-   Rework axios to use more catch
-   Update config for axios
-   Add waiting on clan if too much fetch
-   Update decorator doc

### 2.2.0

-   Pass bot to multi guild support

### 2.1.0

-   Watch clan to detect leaving player
-   send message to change when leaving player detected

### 2.0.1

-   Fix date in trivia game
-   Rework loop in trivia game
-   Set trivia game time to 5 min and add countdown
-   Add more logs
-   Trivia game only send to 18h30, 19h30 and 20h30

### 2.0.0

-   Create this changelog :)
-   Create the trivia game
-   Optimise the decorator
-   Clean code

### 1.2.1

-   Move file to there optimal position to respect the module/feature and module/shared design
-   Fix log in singleton class
-   Update documentation
-   Optimise/Simplify the SlashCommandModel class and all slash-commands

### 1.2.0

-   Add GitHub issues/feature template
-   Update dependency
-   Update prettier conf
-   Update sequence diagrams for Auto-reply
-   Update logic of Auto-reply
-   Update documentation
-   Create logger decorator
-   Create logger class to simply the use of log method

### 1.1.1

-   Fix readme

### 1.1.0

-   Rewrite all the documentations about the projet in readme and code
-   Create new sequence diagrams and update existing one
-   Used a new architecture in module/feature and module/shared

### 1.0.5

-   Remove SendUtils class
-   Update sequence diagrams
-   Add more log for error

### 1.0.4

-   Update and optimise log class
-   Create new sequence diagrams
-   Optimise feature class
-   Update global log

### 1.0.3

-   Add more log
-   Fix Wot Express newsletter

### 1.0.2

-   Update dependency

### 1.0.1

-   Add versing and auto-release GitHub action

### 1.0.0

-   Projet creation
-   Base architecture
-   Slash-command
-   Handler
-   Events
