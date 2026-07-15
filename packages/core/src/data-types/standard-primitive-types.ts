const parsedAsBoolean = (value: string): boolean | undefined => {
    switch (value) {
        case "true":
            return true
        case "false":
            return false
        default:
            return undefined
    }
}

const parsedAsInteger = (value: string): number | undefined => {
    const int = Number(value)
    return Number.isInteger(int) ? int : undefined
}

/**
 * Standard serializers for boolean-, integer-, and string-typed values.
 */
export const standardSerializers = {
    string: (value: unknown) => value as string,
    boolean: (value: unknown) => `${value as boolean}`,
    integer: (value: unknown) => `${value as number}`
} as const

/**
 * Standard deserializers for boolean-, integer-, and string-typed values.
 */
export const standardDeserializers = {
    string: (value: string) => value,
    boolean: (value: string) => parsedAsBoolean(value),
    integer: (value: string) => parsedAsInteger(value)
} as const

