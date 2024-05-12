# Technical Documentation

This file contain all the writing and technical process I use for the project

<details>
    <summary>Summary</summary>

-   [Project Organisation](#project-organisation)
-   [Generic Type](#generic-type)
-   [Comment](#comment)
-   [Import](#import)
</details>

## Project Organisation

The project have a special organisation, who follow the next diagram

```
src
├── assets
├── logs
├── module
│   ├── core
│   ├── feature
│   └── shared
├── index.ts - Starting point of the bot
└── README.md - Your position
```

### Assets

The assets folder contains all the assets (img) that are used by the bot

### Logs

The logs folder is here that the bot write persistant logs

### Module

The module folder contain the source code of the bot. It's separate in three folders : `core`, `feature` and `shared`

#### Core

Before the 3.1.0, this folder contains all needed file to make the bot works. These files were json file to manage persistant data.

After 3.1.0, the data files were moved to sql database, the folder contain only the backup of the database and the secret.

### Feature & Shared

These two folder a significantly the same, expect that the `feature` if feature center (contain only code for a specific feature) and `shared` contain all code that is used by multiple features

They are organised with the following rule: (example with the feature folder)

```
feature
├── feature 1
│   ├── under-feature 1
│   │   ├── models - For small feature can contain all files of the feature
│   │   │   ├── under-feature-1.model.ts
│   │   │   ├── under-feature-1.type.ts
│   │   │   └── under-feature-1.interface.ts
│   │   ├── name.feature-1.ts
│   │   └── ... - Same as feature 2
│   ├── under-feature 2
│   │   └── ... - Same as feature 2
│   └── under-feature x
│       └── ... - Same as feature 2
├── feature 2
│   ├── models - Contain all classes or function that run logic
│   │   └── feature-2.model.ts
│   ├── types - Contain all types for the feature
│   │   └── feature-2.type.ts
│   ├── interfaces - Contain all interfaces for the feature
│   │   └── feature-2.interface.ts
│   ├── ... - And so on
│   │   └── ... - And so on
│   ├── name.feature-2.ts
│   └── README.md - Optional
└── feature x
    └── ... - Same as feature 2
```

## Generic Type

Generics allow creating 'type variables' which can be used to create classes, functions & type aliases that don't need to explicitly define the types that they use.

### Naming

When implementing generic type you need to put the letter `G` follow by the usage.

Example : `GClass`, `GInteraction`, etc

## Comment

For the comment I only use Js DOC in method/function/class. I find that in code comment make the code more difficult to read. It's better to write good function/method/field/variable with appropriate name.

### Convention for comment

Here the convention for JsDoc

```typescript
/**
 * Description of the method
 *
 * @param {type of the param} param - Description of the param.
 *
 * @returns {type of return} - If the method return something put the line
 */
function example() {}
```

Do the same for all @throw, @template, etc. Only when it's present and necessaries.

If you have no inspiration or just lazy, use Google Gemini ou ChatGPT it works great

## Import

In TypeScript there are two types of import : the `import` and the `import type`

The first one is used to import the module that can be used

The second is used to import the module `AS TYPE`, that means when compiling in javascript the import does not exist, allowing use to easily type thing without importing the type
