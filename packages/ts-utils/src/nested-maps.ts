import { groupBy } from "./maps.js"


export type Nested1Map<T> = Record<string, T> // (for conceptual continuity)
export type Nested2Map<T> = Record<string, Record<string, T>>
export type Nested3Map<T> = Record<string, Record<string, Record<string, T>>>

export type Nested1Mapper<T, R> = (nested1Map: Nested1Map<T>) => Nested1Map<R>
export const mapValuesMapper =
    <T, R>(valueMapFunc: (t: T) => R): Nested1Mapper<T, R> =>
    (map: Record<string, T>): Record<string, R> =>
        Object.fromEntries(Object.entries(map).map(([key, value]) => [key, valueMapFunc(value)]))
// === mapValues(map, valueFunc)

export type Nested2Mapper<T, R> = (nested2Map: Nested2Map<T>) => Nested2Map<R>
export const nested2Mapper = <T, R>(valueMapFunc: (t: T) => R): Nested2Mapper<T, R> =>
    mapValuesMapper(mapValuesMapper(valueMapFunc))

export type Nested3Mapper<T, R> = (nested3Map: Nested3Map<T>) => Nested3Map<R>
export const nested3Mapper = <T, R>(valueMapFunc: (t: T) => R): Nested3Mapper<T, R> =>
    mapValuesMapper(nested2Mapper(valueMapFunc))

/**
 * Return a function that groups an array of things using a group function as a
 *  map : string (group key) &rarr; array of grouped things.
 */
export const grouper =
    <T>(key1Func: (t: T) => string): ((ts: T[]) => Nested1Map<T[]>) =>
        (ts: T[]) =>
            groupBy(ts, key1Func)

/**
 * Return a function that groups an array of things using two group functions as a nested map
 *  map : string (group key 1) &rarr;
 *      map : string (group key 2) &rarr; array of grouped things.
 */
export const nested2Grouper =
    <T>(key1Func: (t: T) => string, key2Func: (t: T) => string): ((ts: T[]) => Nested2Map<T[]>) =>
        (ts: T[]) =>
            mapValuesMapper(grouper(key2Func))(grouper(key1Func)(ts))
// === mapValuesMapper((vs) => groupBy(vs, key2Func))(groupBy(ts, key1Func))

/**
 * Return a function that groups an array of things using two group functions as a nested map
 *  map : string (group key 1) &rarr;
 *      map : string (group key 2) &rarr;
 *          map : string (group key 3) &rarr; array of grouped things.
 */
export const nested3Grouper =
    <T>(key1Func: (t: T) => string, key2Func: (t: T) => string, key3Func: (t: T) => string): ((ts: T[]) => Nested3Map<T[]>) =>
        (ts: T[]) =>
            mapValuesMapper(nested2Grouper(key2Func, key3Func))(grouper(key1Func)(ts))

/**
 * Flat-maps over the values of a
 *  map : string (group key) &rarr; values
 * using the map function, which is also provided with the keys.
 */
export const flatMapValues = <T, R>(map: Record<string, T>, mapFunc: (t: T, key1: string) => R): R[] =>
    Object
        .entries(map)
        .map(
            ([key1, t]) =>
                mapFunc(t, key1)
        )

/**
 * Flat-maps over the values of a nested map
 *  map : string (group key 1) &rarr;
 *      map: string (group key 2) &rarr; values
 * using the map function, which is also provided with the keys.
 */
export const nestedFlatMap2 = <T, R>(nested2Map: Nested2Map<T>, map2Func: (t: T, key1: string, key2: string) => R): R[] =>
    Object
        .entries(nested2Map)
        .flatMap(
            ([key1, nestedMap1]) =>
                flatMapValues(nestedMap1, (t, key2) =>
                    map2Func(t, key1, key2)
                )
        )

/**
 * Flat-maps over the values of a nested map
 *  map : string (group key 1) &rarr;
 *      map: string (group key 2) &rarr;
 *           map: string (group key 3) &rarr; values
 * using the map function, which is also provided with the keys.
 */
export const nestedFlatMap3 = <T, R>(nested3Map: Nested3Map<T>, map3Func: (t: T, key1: string, key2: string, key3: string) => R): R[] =>
    Object
        .entries(nested3Map)
        .flatMap(
            ([key1, nestedMap2]) =>
                nestedFlatMap2(nestedMap2, (t, key2, key3) =>
                    map3Func(t, key1, key2, key3)
                )
        )

