import { groupBy, mapValues } from "@lionweb/core"

/**
 * Sum the given array of numbers.
 */
export const sumNumbers = (nums: number[]): number =>
    nums.reduce((acc, cur) => acc + cur, 0)

export const groupingMapper = <T, R>(
    mapFunc: (ts: T[]) => R,
    groupFunc: (t: T) => string
): (ts: T[]) => Record<string, R> =>
    (ts: T[]): Record<string, R> =>
        mapValues(groupBy(ts, groupFunc), mapFunc)

export const nestedGroupingMapper2 = <T, R>(
    mapFunc: (ts: T[]) => R,
    groupFunc1: (t: T) => string,
    groupFunc2: (t: T) => string,
): (ts: T[]) => Record<string, Record<string, R>> =>
    groupingMapper<T, Record<string, R>>(
        groupingMapper<T, R>(mapFunc, groupFunc2),
        groupFunc1
    )

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

export const nestedFlatMap1 = <T, R>(
    nestedMap1: Record<string, T>,
    map1Func: (key1: string, t: T) => R
): R[] =>
    Object.entries(nestedMap1)
        .flatMap(([key1, t]) => map1Func(key1, t))

export const nestedFlatMap2 = <T, R>(
    nestedMap2: Record<string, Record<string, T>>,
    map2Func: (key1: string, key2: string, t: T) => R
): R[] =>
    Object.entries(nestedMap2)
        .flatMap(([key1, nestedMap1]) =>
            nestedFlatMap1(nestedMap1, (key2, t) => map2Func(key1, key2, t))
        )

export const nestedFlatMap3 = <T, R>(
    nestedMap3: Record<string, Record<string, Record<string, T>>>,
    map3Func: (key1: string, key2: string, key3: string, t: T) => R
): R[] =>
    Object.entries(nestedMap3)
        .flatMap(([key1, nestedMap2]) =>
            nestedFlatMap2(nestedMap2, (key2, key3, t) => map3Func(key1, key2, key3, t))
        )

