/**
 * The `unresolved` symbol indicates a reference value which hasn't been resolved yet.
 * It differs from an unset (`undefined`) value.
 */
export const unresolved = Symbol("unresolved")

/**
 * A type definition for a reference value that can be unresolved.
 */
export type SingleRef<T> = typeof unresolved | T

/**
 * Checks whether a given (at most) single-valued reference actually refers to something.
 */
export const isRef = <T>(ref?: SingleRef<T>): ref is T =>
    ref !== undefined && ref !== unresolved

