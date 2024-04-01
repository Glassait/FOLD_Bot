![GitHub repo file count (file extension)](https://img.shields.io/github/directory-file-count/Glassait/freePuntosBot/src%2Fmodule%2Ffeature%2Fhandlers?type=file&extension=ts&style=flat-square&label=Handler)

# Loop

In the folder you will find all the looping code of the bot.

# Create new loop

1. Create new typescript file in the folder with the patter
    ```text
    name.loop.ts
    ```
2. Use the following template

    ```typescript
    import { Client } from 'discord.js';

    module.exports = async (client: Client): Promise<void> => {
        // Thing to execute in a loop, you have to create the loop yourself
    };
    ```

3. Fill the executed part
4. Congrats the new loop will be available and automatically executed in the `index.ts`

## Log

If you want to add persistent log in to execute of the loop, follow the following step.

1. Add the logger and the context to the file

    ```typescript
    import { Logger } from '../../shared/classes/logger';
    import { Context } from '../../shared/classes/context';

    const logger: Logger = new Logger(new Context('NAME-LOOP'));
    ```

2. In the context give the name of the handler
3. Call the level you want with the `logger`, ex:
    ```typescript
    logger.info('Message to the log');
    ```
