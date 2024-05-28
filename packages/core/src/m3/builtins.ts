import {LanguageFactory} from "./factory.js"
import { Classifier, Concept, Datatype, lioncoreBuiltinsKey, Property } from "./types.js"
import {StringsMapper} from "../utils/string-mapping.js"
import {currentReleaseVersion} from "../version.js"
import { LionCore_builtins_Json, LIONWEB_INTEGER_TYPE } from "@lionweb/validation"


const lioncoreBuiltinsIdAndKeyGenerator: StringsMapper =
    (...names) => [lioncoreBuiltinsKey, ...names.slice(1)].join("-")


const factory = new LanguageFactory(
    "LionCore_builtins",
    currentReleaseVersion,
    lioncoreBuiltinsIdAndKeyGenerator,
    lioncoreBuiltinsIdAndKeyGenerator
)
/*
 * ID == key: `LionCore-builtins-${qualified name _without_ "LionCore-builtins", dash-separated}`
 */


/**
 * Definition of a LionCore language that serves as a standard library of built-in primitive types.
 */
const lioncoreBuiltins = factory.language


const stringDatatype = factory.primitiveType("String")
const booleanDatatype = factory.primitiveType("Boolean")
const integerDatatype = factory.primitiveType("Integer")
const jsonDatatype = factory.primitiveType("JSON")


const node = factory.concept("Node", true)


const isBuiltinNodeConcept = (classifier: Classifier) =>
       classifier instanceof Concept
    && classifier.language.key === lioncoreBuiltinsKey
    && classifier.language.version === currentReleaseVersion
    && classifier.key === builtinClassifiers.node.key
    && (classifier as Concept).abstract


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
type PrimitiveTypeValue = BuiltinPrimitive | any
type SpecificPrimitiveTypeDeserializer = (value: string)=>PrimitiveTypeValue

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

export class PrimitiveTypeSerializer {

    private deserializerByType = new Map<Datatype, SpecificPrimitiveTypeDeserializer>()

    constructor() {
        this.deserializerByType.set(stringDatatype, (value)=>value)
        this.deserializerByType.set(booleanDatatype, (value)=>JSON.parse(value))
        this.deserializerByType.set(integerDatatype, (value)=>Number(value))
        this.deserializerByType.set(jsonDatatype, (value)=>JSON.parse(value as string))
    }

    registerDeserializer(dataType: Datatype, deserializer: SpecificPrimitiveTypeDeserializer) {
        this.deserializerByType.set(dataType, deserializer)
    }

    deserializeValue(value: string | undefined, property: Property): PrimitiveTypeValue | undefined {
        if (value === undefined) {
            if (property.optional) {
                return undefined
            }
            throw new Error(`can't deserialize undefined as the value of a required property`)
        }
        const { type } = property
        const specificDeserializer = this.deserializerByType.get(type!!)
        if (specificDeserializer != null) {
            return specificDeserializer(value)
        } else {
            throw new Error(`can't deserialize value of type "${type!.name}": ${value}`)
        }
    }
}


export type {
    BuiltinPrimitive
}

export {
    builtinPrimitives,
    builtinClassifiers,
    builtinFeatures,
    isBuiltinNodeConcept,
    lioncoreBuiltins,
    serializeBuiltin
}

