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

/**
 * @return a view of the given array of items with duplicates removed.
 */
export const uniquesAmong = <T>(ts: T[]): T[] =>
    [...new Set(ts)]


/**
 * @return the defined values of given type (parameter) `T` from the given array,
 * leaving out the `null` or `undefined` values.
 */
export const keepDefineds = <T>(ts: (T | null | undefined)[]): T[] =>
    ts.filter((t) => t !== undefined && t !== null) as T[]

