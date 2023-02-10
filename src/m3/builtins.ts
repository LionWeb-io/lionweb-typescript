import {MetamodelFactory} from "./factory.ts"
import {lioncoreIdGen} from "./id-generation.ts"
import {lioncoreBuiltinsQName, Property} from "./types.ts"


const factory = new MetamodelFactory(lioncoreBuiltinsQName, lioncoreIdGen)

/**
 * Definition of a LIonCore metamodel that serves as a standard library of built-in primitive types.
 */
export const lioncoreBuiltins = factory.metamodel

export const stringDatatype = factory.primitiveType("String")
export const booleanDatatype = factory.primitiveType("Boolean")
export const intDatatype = factory.primitiveType("Integer")
export const jsonDatatype = factory.primitiveType("JSON")

lioncoreBuiltins.havingElements(
    stringDatatype,
    booleanDatatype,
    intDatatype,
    jsonDatatype
)


export type BuiltinPrimitive = string | boolean | number | Record<string, unknown>

export const serializeBuiltin = (value: BuiltinPrimitive): string => {
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


export const deserializeBuiltin = (value: string | undefined, property: Property): BuiltinPrimitive | undefined => {
    if (value === undefined) {
        if (property.optional) {
            return undefined
        }
        throw new Error(`can't deserialize undefined as the value of a required property`)
    }
    const {type} = property
    switch (type!.simpleName) {
        case "String": return value
        case "Boolean": return JSON.parse(value)
        case "Integer": return Number(value)
        case "JSON": return JSON.parse(value as string)
        default:
            throw new Error(`can't deserialize value of type "${type!.simpleName}": ${value}`)
    }
}

