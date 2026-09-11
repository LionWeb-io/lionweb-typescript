/**
 * Various functional utilities for sorting things with strings.
 */

import { sorterWith } from "./sorting.js"
import { localeStringComparer, mappedComparer } from "./comparer.js"


export const sortedStrings = sorterWith(localeStringComparer)

export const sortedStringsByUppercase = sorterWith<string>(
    mappedComparer((str) => str.toUpperCase(), localeStringComparer)
)

