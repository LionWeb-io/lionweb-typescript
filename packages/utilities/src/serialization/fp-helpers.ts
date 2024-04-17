import {groupBy, mapValues} from "@lionweb/core"

/**
 * Sum the given array of numbers.
 */
export const sumNumbers = (nums: number[]): number =>
    nums.reduce((acc, cur) => acc + cur, 0)


/**
 * Return a function that groups an array of things using a group function as a
 *  map : string (group key) &rarr; array of grouped things mapped using the map function.
 */
export const groupingMapper = <T, R>(
    mapFunc: (ts: T[]) => R,
    groupFunc: (t: T) => string
): (ts: T[]) => Record<string, R> =>
    (ts: T[]): Record<string, R> =>
        mapValues(groupBy(ts, groupFunc), mapFunc)

/**
 * Return a function that groups an array of things using two group functions as a nested map
 *  map : string (group key 1) &rarr;
 *      map : string (group key 2) &rarr; array of grouped things mapped using the map function.
 */
export const nestedGroupingMapper2 = <T, R>(
    mapFunc: (ts: T[]) => R,
    groupFunc1: (t: T) => string,
    groupFunc2: (t: T) => string,
): (ts: T[]) => Record<string, Record<string, R>> =>
    groupingMapper<T, Record<string, R>>(
        groupingMapper<T, R>(mapFunc, groupFunc2),
        groupFunc1
    )

/**
 * Return a function that groups an array of things using two group functions as a nested map
 *  map : string (group key 1) &rarr;
 *      map : string (group key 2) &rarr;
 *          map : string (group key 3) &rarr; array of grouped things mapped using the map function.
 */
export const nestedGroupingMapper3 = <T, R>(
    mapFunc: (ts: T[]) => R,
    groupFunc1: (t: T) => string,
    groupFunc2: (t: T) => string,
    groupFunc3: (t: T) => string
): (ts: T[]) => Record<string, Record<string, Record<string, R>>> =>
    groupingMapper<T, Record<string, Record<string, R>>>(
        nestedGroupingMapper2(mapFunc, groupFunc2, groupFunc3),
        groupFunc1
    )


/**
 * Flat-maps over the values of a
 *  map : string (group key) &rarr; values
 * using the map function.
 */
export const flatMapValues = <T, R>(
    map: Record<string, T>,
    mapFunc: (key1: string, t: T) => R
): R[] =>
    Object.entries(map)
        .map(([key1, t]) => mapFunc(key1, t))

/**
 * Flat-maps over the values of a nested map
 *  map : string (group key 1) &rarr;
 *      map: string (group key 2) &rarr; values
 * using the map function.
 */
export const nestedFlatMap2 = <T, R>(
    nestedMap2: Record<string, Record<string, T>>,
    map2Func: (key1: string, key2: string, t: T) => R
): R[] =>
    Object.entries(nestedMap2)
        .flatMap(([key1, nestedMap1]) =>
            flatMapValues(nestedMap1, (key2, t) => map2Func(key1, key2, t))
        )

/**
 * Flat-maps over the values of a nested map
 *  map : string (group key 1) &rarr;
 *      map: string (group key 2) &rarr;
 *           map: string (group key 3) &rarr; values
 * using the map function.
 */
export const nestedFlatMap3 = <T, R>(
    nestedMap3: Record<string, Record<string, Record<string, T>>>,
    map3Func: (key1: string, key2: string, key3: string, t: T) => R
): R[] =>
    Object.entries(nestedMap3)
        .flatMap(([key1, nestedMap2]) =>
            nestedFlatMap2(nestedMap2, (key2, key3, t) => map3Func(key1, key2, key3, t))
        )

