/**
 * This type alias helps ensure that all properties within an object and its nested objects are non-nullable (not null or undefined). It achieves this by recursively checking and enforcing non-null types throughout the object structure.
 */
export type DeepNonNullables<T> = { [P in keyof T]: T[P] extends object ? DeepNonNullables<T[P]> : NonNullable<T[P]> };
