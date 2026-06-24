/**
 * Various functional utilities for comparing things.
 */


/**
 * Type def. for arguments of {@link Array.sort}.
 */
export type Comparer<T> = (l: T, r: T) => number


/**
 * {@link Comparer} that compares strings using the default/standard lexicographical ordering.
 */
export const regularStringComparer: Comparer<string> = (l, r) =>
    l === r
        ? 0
        : (l < r ? -1 : 1)

/**
 * {@link Comparer} that compares strings taking locale into account.
 */
export const localeStringComparer: Comparer<string> = (l, r) =>
    l.localeCompare(r)


/**
 * Implementation of a lexicographical comparison of the given `l` and `r`, using the given `comps` comparers.
 * This is meant for internal use only.
 * It has tail recursion in the hope of the JS VM recognized that, and optimizing it out through unrolling.
 */
const lexiCompare = <T>(l: T, r: T, comps: Comparer<T>[]): number => {
    if (comps.length === 0) {
        throw new Error(`can’t (lexicographically) compare with 0 comparers`)
    }
    const acc = comps[0](l, r)
    return (acc !== 0 || comps.length === 1)
        ? acc
        : lexiCompare(l, r, comps.slice(1))
}

/**
 * @return a {@link Comparer comparer} that performs the lexicographical composition of the given comparers.
 */
export const lexiComparer = <T>(comps: Comparer<T>[]): Comparer<T> => {
    if (comps.length === 0) {
        throw new Error(`can’t (lexicographically) compose 0 comparers`)
    }
    return (l, r) => lexiCompare(l, r, comps)
}


/**
 * @return a {@link Comparer comparer} that compares
 * `f(t)` for `t: T` using `comp` to compare strings.
 */
export const mappedComparer = <T, V>(f: (t: T) => V, comp: Comparer<V>): Comparer<T> =>
        (l, r) => comp(f(l), f(r))

/**
 * @return a {@link Comparer comparer} that lexicographically compares
 * `(f_1(t), f_2(t), ..., f_n(t))` for `t: T` using `comp` to compare strings.
 *
 * Usage:
 *
 * `mapWithN([t => t.a, t => t.b, t => t.c], regularStringComparer)` compares `T`s lexicographically on the tuple (a, b, c).
 */
export const mappedLexiComparer = <T, V>(fs: ((t: T) => V)[], comp: Comparer<V>): Comparer<T> =>
        lexiComparer(fs.map((f) => mappedComparer(f, comp)))

