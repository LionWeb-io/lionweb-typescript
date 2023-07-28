/**
 * Feature's values are often persisted as either `undefined`, a single object, or an array of objects,
 * regardless of the actual cardinality of that feature.
 * This is e.g. the case when parsing an Ecore XML metamodel file.
 * This type definition captures that phenomenon.
 */
export type AnyNumberOf<T> = undefined | T | T[]

/**
 * Turns a {@link AnyNumberOf feature's value} into an array of objects
 * (possibly empty), regardless of the feature's cardinality and how its
 * value happened to be parsed.
 */
export const asArray = <T>(thing: AnyNumberOf<T>): T[] => {
    if (thing === undefined) {
        return []
    }
    if (Array.isArray(thing)) {
        return thing
    }
    return [thing]
}

