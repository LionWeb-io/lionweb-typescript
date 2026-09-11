/**
 * Various functional utilities for sorting things with strings.
 */

import { sorterWith } from "./sorting.js"
import { localeStringComparer, mappedComparer, regularStringComparer } from "./comparer.js"


/**
 * @deprecated Use a {@link Sorter} built with {@link sorterWith}, instead.
 * Build the required {@link Comparer} using {@link }
 */
export const sortByStringKey = <T>(ts: T[], stringFunction: (t: T) => string) =>   // TODO  rename -> sortByStringFunction
    sorterWith(mappedComparer(stringFunction, regularStringComparer))(ts)


/**
 * @deprecated Use `Sorter<string>` instead.
 */
export type StringSorter = (strings: string[]) => string[]

export const sortedStrings = sorterWith(localeStringComparer)

export const sortedStringsByUppercase = sorterWith<string>(
    mappedComparer((str) => str.toUpperCase(), localeStringComparer)
)

