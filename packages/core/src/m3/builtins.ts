import {LanguageFactory} from "./factory.js"
import {lioncoreBuiltinsKey, Property} from "./types.js"
import {concatenator} from "../utils/string-mapping.js"
import {currentReleaseVersion} from "../version.js"


const lioncoreBuiltinsIdAndKeyGenerator = concatenator("-")


const factory = new LanguageFactory(
    lioncoreBuiltinsKey,
    currentReleaseVersion,
    lioncoreBuiltinsIdAndKeyGenerator,
    lioncoreBuiltinsIdAndKeyGenerator
)

/**
 * Definition of a LionCore language that serves as a standard library of built-in primitive types.
 */
const lioncoreBuiltins = factory.language


const stringDatatype = factory.primitiveType("String")
const booleanDatatype = factory.primitiveType("Boolean")
const integerDatatype = factory.primitiveType("Integer")
const jsonDatatype = factory.primitiveType("JSON")


const node = factory.concept("Node", true)


const inamed = factory.interface("INamed")

const inamed_name = factory.property(inamed, "name")
    .ofType(stringDatatype)

inamed.havingFeatures(inamed_name)


lioncoreBuiltins.havingEntities(
    stringDatatype,
    booleanDatatype,
    integerDatatype,
    jsonDatatype,
    node,
    inamed
)


type BuiltinPrimitive = string | boolean | number | Record<string, unknown> | Array<unknown>

const builtinPrimitives = {
    stringDatatype,
    booleanDatatype,
    integerDatatype,
    jsonDatatype
}

const builtinClassifiers = {
    node,
    inamed
}

const builtinFeatures = {
    inamed_name
}


const serializeBuiltin = (value: BuiltinPrimitive): string => {
    switch (typeof value) {
        case "string": return value
        case "boolean": return `${value}`
        case "number": return `${value}`    // TODO  check whether integer?
        case "object": {
            try {
                return JSON.stringify(value, null)
            } catch (_) {
                // pass-through
            }
        }
    }
    throw new Error(`can't serialize value of built-in primitive type: ${value}`)
}


const deserializeBuiltin = (value: string | undefined, property: Property): BuiltinPrimitive | undefined => {
    if (value === undefined) {
        if (property.optional) {
            return undefined
        }
        throw new Error(`can't deserialize undefined as the value of a required property`)
    }
    const {type} = property
    switch (type!.name) {
        case "String": return value
        case "Boolean": return JSON.parse(value)
        case "Integer": return Number(value)
        case "JSON": return JSON.parse(value as string)
        default:
            throw new Error(`can't deserialize value of type "${type!.name}": ${value}`)
    }
}


export type {
    BuiltinPrimitive
}

export {
    lioncoreBuiltins,
    builtinPrimitives,
    builtinClassifiers,
    builtinFeatures,
    serializeBuiltin,
    deserializeBuiltin
}

