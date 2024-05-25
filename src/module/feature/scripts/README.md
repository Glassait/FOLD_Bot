![GitHub repo file count (file extension)](https://img.shields.io/github/directory-file-count/Glassait/FOLD_Bot/src%2Fmodule%2Ffeature%2Fscripts?type=file&extension=ts&style=flat-square&label=Scripts)

# Scripts

In the folder you will find all the scripts of the bot.

A script is basically a code that you need to run only one time when the bot start.

## Create new script

1. Create new typescript file in the folder with the patter

    ```text
    name.script.ts
    ```
   
2. Use the following template

    ```typescript
    import { ScriptModel } from './models/script.model';

    // The client param is optionnal, and can be remove if not need
    module.exports = new ScriptModel('name', async (client: Client) => {
        // Code to execute
    });
    ```

3. Fill the name and arrow function part
4. Congrats the new script will be available, the registering of the command is automatic in the handler `script.handler.ts`

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
