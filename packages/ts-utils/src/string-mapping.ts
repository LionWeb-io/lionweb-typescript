export type StringsMapper = (...strings: string[]) => string

export type StringMapper = (str: string) => string


export const concatenator = (separator: string): StringsMapper =>
    (...strings) => strings.join(separator)

export const lastOf: StringsMapper =
    (...strings) => strings[strings.length - 1]

export const chain = (stringsMapper: StringsMapper, ...stringMappers: StringMapper[]): StringsMapper =>
    (...strings: string[]) => {
        let result = stringsMapper(...strings)
        stringMappers.forEach((mapper) => {
            result = mapper(result)
        })
        return result
    }

