![GitHub repo file count (file extension)](https://img.shields.io/github/directory-file-count/Glassait/FOLD_Bot/src%2Fmodule%2Ffeature%2Fslash-commands?type=file&extension=ts&style=flat-square&label=Slash%20Command)

# Slash Command

In the folder you will find all the slash command of the bot.

<p id="createNewSlashCommand"></p>

## Create new slash command

1. Create new typescript file in the folder with the patter
    ```text
    name.slash-command.ts
    ```
2. Use the following template

    ```typescript
    import { ChatInputCommandInteraction } from 'discord.js';
    import { SlashCommandModel } from './models/slash-command.model';

    module.exports = new SlashCommandModel('name', 'description', async (interaction: ChatInputCommandInteraction): Promise<void> => {
        // The code execute by the commande
    });
    ```

3. Fill the name (IMPORTANT the name need to be the same has the file without the `.slash-command.ts`), description and arrow function part
4. In the commands table in the database add the new slash-command name and the array of guildID like this `id,id,...`
5. Congrats the new slash-command will be available, the registering of the command is automatic in the handler `commands.handler.ts`

## ⚙️ Options & Permission

You can add option and/or permission to the slash command

### Options

The forth arg in the `SlashCommand` constructor is dédicated to options, it takes array of `OptionType`.

Example: The option allow the user to pass people of the discord server.

```typescript
import { SlashCommandMentionableOption } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandModel } from './model/slash-command.model';

module.exports = new SlashCommandModel(
    'ban',
    'Ban user',
    async (interaction: ChatInputCommandInteraction): Promise<void> => {
        // The code execute by the commande
    },
    {
        option: [new SlashCommandMentionableOption().setName('target').setDescription("L'utilisateur à déconnecter").setRequired(true)],
    }
);
```

Actually the `OptionType` have only 2 options `StringOption` and `MentionableOption`, you are free to add more, don't forget to update the `OptionMap` to manage it.

Mode documentation on [discord.js](https://discordjs.guide/slash-commands/advanced-creation.html#adding-options)

### Permission

The last arg in the `SlashCommand` constructor is dédicated to permission. You just have to use the `PermissionsBitField.Flags` class form discord.js.

Example: Only people who can move user and higher can use this command.

```typescript
import { ChatInputCommandInteraction, PermissionsBitField } from 'discord.js';
import { SlashCommandModel } from './model/slash-command.model';

module.exports = new SlashCommandModel(
    'move',
    'Move the user',
    async (interaction: ChatInputCommandInteraction): Promise<void> => {
        // The code execute by the commande
    },
    {
        permission: PermissionsBitField.Flags.MoveMembers,
    }
);
```

More documentation on [discord.js](https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags)

## Log

If you want to add persistent log in to execute of the event, follow the following step.

1. Add the logger and the context to the file

    ```typescript
    import { Logger } from '../../shared/utils/logger';
    import { basename } from 'node:path';

    const logger: Logger = new Logger(basename(__filename));
    ```

2. In the context give the name of the slash-command
3. Call the level you want with the `logger`, ex:

    ```typescript
    logger.info('Message to the log');
    ```
