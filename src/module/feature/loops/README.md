# Loop ![GitHub repo file count (file extension)](https://img.shields.io/github/directory-file-count/Glassait/FOLD_Bot/src%2Fmodule%2Ffeature%2Floops?type=file&extension=ts&style=flat-square&label=Loop)

In the folder you will find all the looping code of the bot.

# Create new loop

1. Create new typescript file in the folder with the patter
    ```text
    name.loop.ts
    ```
2. Use the following template

    ```typescript
    import type { Client } from 'discord.js';
    import type { BotLoop } from './bot-loop.type';

    module.exports = {
        name: 'LoopName',
        execute: async (client: Client): Promise<void> => {
            // Thing to execute in a loop, you have to create the loop yourself
        },
    } as BotLoop;
    ```

3. Change the name of the loop and fill the executed part (more information in [BotLoop type](./types/bot-loop.type.ts))
4. Congrats the new loop will be available and automatically executed in the `index.ts`

## CronUtil

The utility class [CronUtil](../../shared/utils/cron.util.ts) have a method that allow to tu easily create loop from cron

Here an example of how to use it

```typescript
import type { Client } from 'discord.js';
import { TimeUtil } from '../../shared/utils/time.util';
import type { BotLoop } from './types/bot-loop.type';

module.exports = {
    name: 'ExampleOfLoop',
    execute: async (client: Client): Promise<void> => {
        CronUtil.createCron('* * * * * *', 'ExampleOfLoop', async (): Promise<void> => {
            // Executing every second
        });
    },
} as BotLoop;
```

## Log

If you want to add persistent log in to execute of the loop, follow the following step.

1. Add the logger and the context to the file

    ```typescript
    import { Logger } from '../../shared/utils/logger';
    import { basename } from 'node:path';

    const logger: Logger = new Logger(basename(__filename));
    ```

2. Call the level you want with the `logger`, ex:

    ```typescript
    logger.info('Message to the log');
    ```
