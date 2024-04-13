## Technical Documentation

This file contain all the writing and Technical process I use for the project

<details>
    <summary>Summary</summary>

-   [Generic Type](#generic-type)
-   [Comment](#comment)
</details>

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

## Import

In TypeScript there are two types of import : the `import` and the `import type`

The first one is used to import the module that can be used

The second is used to import the module `AS TYPE`, that means when compiling in javascript the import does not exist, allowing use to easily type thing without importing the type