import { asMinimalJsonString } from "@lionweb/ts-utils"
import {
    LionCoreBuiltinsFacade,
    lioncoreBuiltinsIdAndKeyGenerator,
    newPropertyValueDeserializerRegistry,
    newPropertyValueSerializerRegistry,
    propertyValueDeserializerFrom,
    propertyValueSerializerFrom
} from "./builtins-common.js"
import { isBuiltinNodeConcept } from "./builtins-function.js"
import { LanguageFactory } from "./factory.js"


const factory = new LanguageFactory(
    "LionCore_builtins",
    "2023.1",
    lioncoreBuiltinsIdAndKeyGenerator,
    lioncoreBuiltinsIdAndKeyGenerator
)
/*
 * ID == key: `LionCore-builtins-${qualified name _without_ "LionCore-builtins", dash-separated}`
 */


const stringDataType = factory.primitiveType("String")
const booleanDataType = factory.primitiveType("Boolean")
const integerDataType = factory.primitiveType("Integer")
const jsonDataType = factory.primitiveType("JSON")

const node = factory.concept("Node", true)

const inamed = factory.interface("INamed")

const inamed_name = factory.property(inamed, "name").ofType(stringDataType)


export const lioncoreBuiltinsFacade: LionCoreBuiltinsFacade = {
    language: factory.language,
    propertyValueDeserializer: propertyValueDeserializerFrom(
        newPropertyValueDeserializerRegistry()
            .set(stringDataType, (value) => value)
            .set(booleanDataType, (value) => JSON.parse(value))
            .set(integerDataType, (value) => Number(value))
            .set(jsonDataType, (value) => JSON.parse(value as string))
    ),
    propertyValueSerializer: propertyValueSerializerFrom(
        newPropertyValueSerializerRegistry()
            .set(stringDataType, (value) => value as string)
            .set(booleanDataType, (value) => `${value as boolean}`)
            .set(integerDataType, (value) => `${value as number}`)
            .set(jsonDataType, (value) => asMinimalJsonString(value))
    ),
    classifiers: { node, inamed },
    features: { inamed_name },
    primitiveTypes: {
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
}


/**
 * Definition of a LionCore language that serves as a standard library of built-in primitive types.
 *
 * @deprecated Use {@code lioncoreBuiltinsFacade.isBuiltinNodeConcept} instead.
 */
export const lioncoreBuiltins = factory.language
/**
 * @deprecated Use {@code lioncoreBuiltinsFacade.primitiveTypes} instead.
 */
export const builtinPrimitives = lioncoreBuiltinsFacade.primitiveTypes
/**
 * @deprecated Use {@code lioncoreBuiltinsFacade.classifiers} instead.
 */
export const builtinClassifiers = lioncoreBuiltinsFacade.classifiers
/**
 * @deprecated Use {@code lioncoreBuiltinsFacade.features} instead.
 */
export const builtinFeatures = lioncoreBuiltinsFacade.features
/**
 * @deprecated Use {@link isBuiltinNodeConcept} instead.
 */
export const isBuiltinConcept = isBuiltinNodeConcept

