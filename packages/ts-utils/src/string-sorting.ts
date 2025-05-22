/**
 * Various functional utilities for sorting things.
 */


type Comparer<T> = (l: T, r: T) => number

const stringCompare: Comparer<string> = (l, r): number =>
    l === r ? 0 : (l > r ? 1 : -1)

const stringyCompare = <T>(keyFunc: (t: T) => string): Comparer<T> =>
    (l: T, r: T) => stringCompare(keyFunc(l), keyFunc(r))

export const sortByStringKey = <T>(ts: T[], keyFunc: (t: T) => string) =>
    [...ts].sort(stringyCompare(keyFunc))


export type StringSorter = (strings: string[]) => string[]

const sortedStringsWith = (strMap: (str: string) => string): StringSorter =>
    (strings) => {
        strings.sort((l, r) => strMap(l).localeCompare(strMap(r)))
        return strings
    }

export const sortedStrings = sortedStringsWith((str) => str)

export const sortedStringsByUppercase = sortedStringsWith((str) => str.toUpperCase())

