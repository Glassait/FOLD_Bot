# Singleton ![GitHub repo file count (file extension)](https://img.shields.io/github/directory-file-count/Glassait/FOLD_Bot/src%2Fmodule%2Fshared%2Fsingleton?type=file&extension=ts&style=flat-square&label=Singleton)

All classes in this folder have to implement the singleton pattern ([more information](https://refactoring.guru/fr/design-patterns/singleton))

<details>
   <summary>Summary</summary>

-   [Create a new singleton](#create-a-new-singleton)
    -   [Examples](#examples)
    -   [Usages](#usage)
-   [Logger](#logger)

</details>

## Create a new singleton

To create a new singleton, the class need to respect some points:

-   A static field that store the instance, mostly named `instance`
-   A static getter for the instance, the getter return the instance but if the instance is not initialised, it will create it with the constructor
-   A private constructor, used only one time in the getter

### Examples

```typescript
export class ExampleSingleton {
    private static _instance: ExampleSingleton;

    public static get instance(): ExampleSingleton {
        if (!this._instance) {
            this._instance = new ExampleSingleton();
        }

        return this._instance;
    }

    private constructor() {
        // Do something
    }

    public showInstance(): void {
        console.log(this._instance);
    }
}
```

### Usage

```typescript
const example = ExampleSingleton.instance;
example.showInstance(); // Object with id 1
ExampleSingleton.instance.showInstance(); // Object with id 1

const newExample = new ExampleSingleton(); // ERROR - Constructor of class ExampleSingleton is private and only accessible within the class declaration
```

## Logger

The application used persistant logging write in markdown.

The class that manage the log is a [singleton](./logger.singleton.ts), but you don't directly used the singleton. In executed file, you are using the [direct class](../utils/logger.ts) that used an instance of the singleton.
