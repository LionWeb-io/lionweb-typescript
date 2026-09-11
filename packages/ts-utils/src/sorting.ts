import { Comparer } from "./comparer.js"


/**
 * Type def. for functions that (purportedly) sort things.
 */
export type Sorter<T> = (ts: T[]) => T[]

/**
 * @return A function that sorts an array of `T`s, given a comparison function.
 * (The function returned creates a defensive copy of that array.)
 * (Can be replaced with `Array.toSorted(<comparer>)` once ES2027 is adopted.)
 */
export const sorterWith = <T>(comparer: Comparer<T>): Sorter<T> =>
    (ts: T[]) =>
        [...ts].sort(comparer)

