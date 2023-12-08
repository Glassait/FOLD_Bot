![GitHub repo file count (file extension)](https://img.shields.io/github/directory-file-count/Glassait/freePuntosBot/src%2Fmodule%2Ffeature%2Fevents?type=file&extension=ts&style=flat-square&label=Events)

# Events

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#create-new-event">Create new Event</a>
    </li>
    <li>
        <a href="#log">Log</a>    
    </li>
  </ol>
</details>

In the folder you will find all the events of the bot.

##  Create new events

1. Create new typescript file in the folder with the patter 
    ```text
    name.event.ts
    ```
2. Use the following template
    ```typescript
    import { Client, Events, Interaction } from 'discord.js';
    import { BotEvent } from '../../shared/types/bot-event.type';
   
    const event: BotEvent = {
        name: undefined, // The name of the event, used Events
        once: undefined, // If the event is only executer once
        async execute(_client: Client, interaction: Interaction): Promise<void> {
            // Code to execute when event is raised
        },
    };
   
    export default event;
    ```
3. Fill the name with `Events`, once and execute part
4. Congrats the new events will be available, the registering of the event is automatic in the handler `event.handler.ts`

## Log

If you want to add persistent log in to execute of the event, follow the following step.

1. Add the logger and the context to the file 
    ```typescript
    import { LoggerSingleton } from '../../../singleton/logger.singleton';
    import { Context } from '../../../utils/context.class';

    const logger: LoggerSingleton = LoggerSingleton.instance;
    const context: Context = new Context('NAME-EVENT');
    ```
2. In the context give the name of the slash command
3. Call the level you dans with the `logger`, ex:
   ```typescript
   logger.info(context, "Message to the log");
   ```