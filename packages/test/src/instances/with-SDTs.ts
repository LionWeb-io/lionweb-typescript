import {
    Enumeration,
    EnumerationLiteralDecoder,
    LionWebVersions,
    PrimitiveType,
    SimpleDataDeserializer,
    SimpleDataSerializer,
    standardDeserializers,
    standardSerializers
} from "@lionweb/core"
import { Currency } from "../languages/with-SDTs.js"

export enum RtCurrency {
    EUR, GBP
}

export const eur42NonDigital = {
    value: 42,
    currency: RtCurrency.EUR,
    digital: false
}

export const decimal42 = {
    int: 42,
    frac: 0
}

export const exampleComplexNumber = {
    real: {
        int: 23,
        frac: 17
    },
    imaginary: {
        int: 42,
        frac: 0
    }
}

export const decodedEnumerationLiteral: EnumerationLiteralDecoder = (encoding, enumeration) => {
    if (enumeration !== Currency) {
        throw new Error(`can only handle the Currency enumeration`)
    }
    switch (encoding) {
        case RtCurrency.EUR: return Currency.literals[0]
        case RtCurrency.GBP: return Currency.literals[1]
        default: throw new Error(`unhandled Currency enumeration literal encoded at runtime as: ${encoding}`)
    }
}

const { booleanDataType, integerDataType, stringDataType } = LionWebVersions.v2024_1.builtinsFacade.primitiveTypes

export const simpleDataSerializer: SimpleDataSerializer = (type, value) => {
    if (type instanceof Enumeration) {
        return decodedEnumerationLiteral(value, type)?.key
    }
    if (type instanceof PrimitiveType) {
        switch (type.key) {
            case booleanDataType.key: return standardSerializers.boolean(value)
            case integerDataType.key: return standardSerializers.integer(value)
            case stringDataType.key: return standardSerializers.string(value)
            default: throw new Error(`unhandled primitive type ${type.name}`)
        }
    }
    throw new Error(`unhandled type: ${type}`)
}

export const simpleDataDeserializer: SimpleDataDeserializer = (type, encoding) => {
    if (type instanceof Enumeration) {
        if (type !== Currency) {
            throw new Error(`can only handle the Currency enumeration`)
        }
        switch (encoding) {
            case Currency.literals[0].key: return RtCurrency.EUR
            case Currency.literals[1].key: return RtCurrency.GBP
            default: throw new Error(`unhandled Currency enumeration literal encoded at serialization as: ${encoding}`)
        }
    }
    if (type instanceof PrimitiveType) {
        if (encoding === null) {
            return undefined
        }
        switch (type.key) {
            case booleanDataType.key: return standardDeserializers.boolean(encoding)
            case integerDataType.key: return standardDeserializers.integer(encoding)
            case stringDataType.key: return standardDeserializers.string(encoding)
            default: throw new Error(`unhandled primitive type ${type.name}`)
        }
    }
    throw new Error(`unhandled type: ${type}`)
}

