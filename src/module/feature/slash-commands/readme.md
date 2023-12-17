![GitHub repo file count (file extension)](https://img.shields.io/github/directory-file-count/Glassait/freePuntosBot/src%2Fmodule%2Ffeature%2Fslash-commands?type=file&extension=ts&style=flat-square&label=Slash%20Command)

# Slash Command

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#create-new-slash-command">Create new slash command</a>
    </li>
    <li>
        <a href="#⚙-options--permission">⚙️ Options & Permission</a>
        <ul>
            <li>
                <a href="#options">Options</a>
            </li>
            <li>
                <a href="#permission">Permission</a>
            </li>
        </ul>
    </li>
    <li>
        <a href="#log">Log</a>    
    </li>
  </ol>
</details>

In the folder you will find all the slash command of the bot.

<p id="createNewSlashCommand"></p>

##  Create new slash command

1. Create new typescript file in the folder with the patter 
    ```text
    name.slash-command.ts
    ```
2. Use the following template
    ```typescript
    import { ChatInputCommandInteraction } from 'discord.js';
    import { SlashCommand } from '../../../utils/slash-command.class';
    
    export const command: SlashCommand = new SlashCommand(
        'name',
        "description",
        async (interaction: ChatInputCommandInteraction): Promise<void> => {
            // The code execute by the commande
        }
    );
    ```
3. Fill the name, description and execute part
4. Congrats the new slash command will be available, the registering of the command is automatic in the handler `commands.handler.ts`

## ⚙️ Options & Permission

You can add option and/or permission to the slash command

### Options

The forth arg in the `SlashCommand` constructor is dédicated to options, it takes array of `OptionType`.

Example: The option allow the user to pass people of the discord server.

```typescript
import { SlashCommandMentionableOption } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommand } from '../../../utils/slash-command.class';

export const command: SlashCommand = new SlashCommand(
    'ban',
    "Ban user",
    async (interaction: ChatInputCommandInteraction): Promise<void> => {
        // The code execute by the commande
    },
    [
        {
            optionType: 'MentionableOption',
            base: new SlashCommandMentionableOption().setName('target').setDescription("The user to ban"),
        }
    ]
);
```

Actually the `OptionType` have only 2 options `StringOption` and `MentionableOption`, you are free to add more, don't forget to update the `SlashCommand` constructor to manage it.

Mode documentation on [discord.js](https://discordjs.guide/slash-commands/advanced-creation.html#adding-options)

### Permission

The last arg in the `SlashCommand` constructor is dédicated to permission. You just have to use the `PermissionsBitField.Flags` class form discord.js.

Example: Only people who can move user and higher can use this command.

```typescript
import { ChatInputCommandInteraction, PermissionsBitField } from 'discord.js';
import { SlashCommand } from '../../../utils/slash-command.class';

export const command: SlashCommand = new SlashCommand(
    'move',
    "Move the user",
    async (interaction: ChatInputCommandInteraction): Promise<void> => {
        // The code execute by the commande
    },
    null,
    PermissionsBitField.Flags.MoveMembers
);
```

More documentation on [discord.js](https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags)

## Log

If you want to add persistent log in to execute of the event, follow the following step.

1. Add the logger and the context to the file
    ```typescript
    import { Logger } from '../../shared/classes/logger';
    import { Context } from '../../../utils/context.class';

    const logger: Logger = new Logger(new Context('NAME-SLASH-COMMAND'));
    ```
2. In the context give the name of the slash-command
3. Call the level you want with the `logger`, ex:
   ```typescript
   logger.info("Message to the log");
   ```