/**
 * A type for functions that map any number of strings (as a variadic argument) to a single string.
 */
export type StringsMapper = (...strings: string[]) => string

/**
 * A type for functions that map strings to strings.
 */
export type StringMapper = (str: string) => string


/**
 * @return a {@link StringsMapper function} that concatenates the strings passed into it, using the given separator string.
 */
export const concatenator = (separator: string): StringsMapper =>
    (...strings) => strings.join(separator)

/**
 * @return a {@link StringsMapper function} that picks the last string of the strings passed into it.
 * (This means that there must always be at least one string passed in.)
 */
export const lastOf: StringsMapper =
    (...strings) => strings[strings.length - 1]

/**
 * @return a {@link StringsMapper function} that chains the given {@link StringsMapper functions} (at least 1),
 * in that order.
 * (This is straightforward functional composition.)
 */
export const chain = (stringsMapper: StringsMapper, ...stringMappers: StringMapper[]): StringsMapper =>
    (...strings: string[]) => {
        let result = stringsMapper(...strings)
        stringMappers.forEach((mapper) => {
            result = mapper(result)
        })
        return result
    }

