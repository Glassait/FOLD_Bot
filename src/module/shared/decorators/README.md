# Decorator

This folder contain only decorator related file.

You can find in the readme all types of decorator used and implement in the project.

<details>
    <summary>Summary</summary>

-   [Class Decorator](#class-decorator)
    -   [Implementation](#implementation)
    -   [Usage](#usage)
-   [Field Decorator](#field-decorator)
    -   [Implementation](#implementation-1)
    -   [Usage](#usage-1)
-   [Acknowledgements](#acknowledgements)
</details>

## Naming convention

All decorators name have to be in `Pascal case`

## Class Decorator

A class decorator is a function that can be used on JS class, used to modify or extend the behavior of a class.

### Implementation

The following decorator is used without parenthesise

```typescript
/**
 * Base type to define a class
 */
type Constructor = new (...args: any[]) => any;

function Decorator<GClass extends Constructor>(gClass: GClass, _context: ClassDecoratorContext<GClass>): GClass {
    return class extends gClass {
        constructor(...args: any[]) {
            super(...args);
            // Do thing during the initialisation of the class
        }
    };
}
```

### Usage

```typescript
@Decorator
class Example {}
```

## Field Decorator

A field decorator is a function that can be used on JS class, used to modify or extend the behavior of a field.

### Implementation

-   The following decorator is used without parenthesise

```typescript
function Decorator<GClass extends Constructor, GField>(target: undefined, _context: ClassFieldDecoratorContext<GClass, GField>) {
    return function (this: GClass, field: GField) {
        // Do thing
    };
}
```

-   The following decorator is used with parenthesise

```typescript
function Decorator(param) {
    return function actual<GClass extends Constructor, GField>(target: undefined, _context: ClassFieldDecoratorContext<GClass, GField>) {
        return function (this: GClass, field: GField) {
            // Do thing
        };
    };
}
```

### Usage

-   Case without parenthesise

```typescript
class Example {
    @Decorator
    a: string = 'example';
}
```

-   Case with parenthesise

```typescript
class Example {
    @Decorator('example')
    a: string = 'example';
}
```

## Acknowledgements

-   [medium.com](https://medium.com/@islizeqiang/a-quick-guide-to-typescript-5-0-decorators-d06cabe09e8c#:~:text=Decorators%20are%20a%20powerful%20feature,without%20altering%20their%20original%20implementation.)
-   [devblogs.microsoft](https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/#decorators)
