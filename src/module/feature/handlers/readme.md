![GitHub repo file count (file extension)](https://img.shields.io/github/directory-file-count/Glassait/freePuntosBot/src%2Fmodule%2Ffeature%2Fhandlers?type=file&extension=ts&style=flat-square&label=Handler)

# Handler

In the folder you will find all the handlers of the bot.

Basically a handler is a script who is executed at the start of the bot

# Create new handler

1. Create new typescript file in the folder with the patter
    ```text
    name.handler.ts
    ```
2. Use the following template

    ```typescript
    import { Client } from 'discord.js';

    module.exports = async (_client: Client): Promise<void> => {
        // Thing to handler at the start of the bot
    };
    ```

3. Fill the executed part
4. Congrats the new handler will be available and automatically executed in the `index.ts`

## Log

If you want to add persistent log in to execute of the event, follow the following step.

1. Add the logger and the context to the file

    ```typescript
    import { Logger } from '../../shared/classes/logger';
    import { Context } from '../../../utils/context.class';

    const logger: Logger = new Logger(new Context('NAME-HANDLER'));
    ```

2. In the context give the name of the handler
3. Call the level you want with the `logger`, ex:
    ```typescript
    logger.info('Message to the log');
    ```
