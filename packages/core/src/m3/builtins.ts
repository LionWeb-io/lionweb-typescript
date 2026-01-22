import { asMinimalJsonString } from "@lionweb/ts-utils"
import {
    lioncoreBuiltinsIdAndKeyGenerator,
    newPropertyValueDeserializerRegistry,
    newPropertyValueSerializerRegistry,
    propertyValueDeserializerFrom,
    propertyValueSerializerFrom
} from "./builtins-common.js"
import { LanguageFactory } from "./factory.js"
import { Classifier, Concept, lioncoreBuiltinsKey } from "./types.js"


const factory = new LanguageFactory(
    "LionCore_builtins",
    "2023.1",
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

const stringDataType = factory.primitiveType("String")
const booleanDataType = factory.primitiveType("Boolean")
const integerDataType = factory.primitiveType("Integer")
const jsonDataType = factory.primitiveType("JSON")

const node = factory.concept("Node", true)

const isBuiltinNodeConcept = (classifier: Classifier) =>
    classifier instanceof Concept &&
    classifier.language.key === lioncoreBuiltinsKey &&
    classifier.language.version === "2023.1" &&
    classifier.key === builtinClassifiers.node.key &&
    (classifier as Concept).abstract

const inamed = factory.interface("INamed")

const inamed_name = factory.property(inamed, "name").ofType(stringDataType)

const builtinPrimitives = {
    stringDataType,
    booleanDataType,
    integerDataType,
    jsonDataType,
    /**
     * Misspelled alias of {@link stringDataType}, kept for backward compatibility, and to be deprecated and removed later.
     */
    stringDatatype: stringDataType,
    /**
     * Misspelled alias of {@link booleanDataType}, kept for backward compatibility, and to be deprecated and removed later.
     */
    booleanDatatype: booleanDataType,
    /**
     * Misspelled alias of {@link integerDataType}, kept for backward compatibility, and to be deprecated and removed later.
     */
    integerDatatype: integerDataType,
    /**
     * Misspelled alias of {@link jsonDataType}, kept for backward compatibility, and to be deprecated and removed later.
     */
    jsonDatatype: jsonDataType
}

const builtinClassifiers = {
    node,
    inamed
}

const builtinFeatures = {
    inamed_name
}

/**
 * Singleton instance of {@link BuiltinPropertyValueDeserializer}.
 */
export const builtinPropertyValueDeserializer = propertyValueDeserializerFrom(
    newPropertyValueDeserializerRegistry()
        .set(stringDataType, (value) => value)
        .set(booleanDataType, (value) => JSON.parse(value))
        .set(integerDataType, (value) => Number(value))
        .set(jsonDataType, (value) => JSON.parse(value as string))

)


/**
 * Singleton instance of {@link BuiltinPropertyValueSerializer}.
 */
export const builtinPropertyValueSerializer = propertyValueSerializerFrom(
    newPropertyValueSerializerRegistry()
        .set(stringDataType, (value) => value as string)
        .set(booleanDataType, (value) => `${value as boolean}`)
        .set(integerDataType, (value) => `${value as number}`)
        .set(jsonDataType, (value) => asMinimalJsonString(value))
)

export { builtinPrimitives, builtinClassifiers, builtinFeatures, isBuiltinNodeConcept, lioncoreBuiltins }

