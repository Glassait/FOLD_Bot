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

<br><br>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#🛠-languages-and-tools-🛠">🛠️ Languages and Tools 🛠️</a>
    </li>
    <li>
        <a href="#getting-started">Getting Started</a>
        <ul>
            <li>
                <a href="#prerequisites">Prerequisites</a>
            </li>
            <li>
                <a href="#installation">Installation</a>
            </li>
        </ul>
    </li>
    <li>
        <a href="#contributing">Contributing</a>    
    </li>
    <li>
        <a href="#roadmap">Roadmap</a>    
    </li>
    <li>
        <a href="#contributing">Contributing</a>    
    </li>
    <li>
        <a href="#acknowledgments">Acknowledgments</a>    
    </li>
    <li>
        <a href="#changelog">Changelog</a>    
    </li>
  </ol>
</details>

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
4. If you want to test the bot, contact me for shutting down the prod bot and run :
    ```sh
     npm run start:mock
    ```
    <br>

---

## Roadmap

-   [x] Update Architecture [(#36)](https://github.com/Glassait/freePuntosBot/issues/36)
-   [x] Add more readme [(#36)](https://github.com/Glassait/freePuntosBot/issues/36)
-   [x] Create Sequence diagram and wiki on github [(#36)](https://github.com/Glassait/freePuntosBot/issues/36)
-   [ ] ~~Translation for Wot express~~ (Closed because pay service)
-   [x] Upgrade autoReply (without IA)
-   [ ] ROULETTE [(#32)](https://github.com/Glassait/freePuntosBot/issues/32)
-   [ ] REPLAY ANALYSE [(#31)](https://github.com/Glassait/freePuntosBot/issues/31)
-   [x] MINI JEU TRIVIA [(#30)](https://github.com/Glassait/freePuntosBot/issues/30)

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

### 1.3.0

-   Create this changelog :)

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
