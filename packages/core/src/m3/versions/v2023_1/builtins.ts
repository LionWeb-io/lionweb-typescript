import { asMinimalJsonString } from "@lionweb/ts-utils"
import {
    LionCoreBuiltinsFacade,
    lioncoreBuiltinsIdAndKeyGenerator,
    newPropertyValueDeserializerRegistry,
    newPropertyValueSerializerRegistry,
    propertyValueDeserializerFrom,
    propertyValueSerializerFrom
} from "../../builtins-common.js"
import { LanguageFactory } from "../../factory.js"
import { ConceptModifier } from "../../types.js"
import { standardDeserializers, standardSerializers } from "../../../data-types/standard-primitive-types.js"


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

const node = factory.concept("Node", ConceptModifier.abstract)

const inamed = factory.interface("INamed")

const inamed_name = factory.property(inamed, "name").ofType(stringDataType)


export const lioncoreBuiltinsFacade: LionCoreBuiltinsFacade = {
    language: factory.language,
    propertyValueDeserializer: propertyValueDeserializerFrom(
        newPropertyValueDeserializerRegistry()
            .set(stringDataType, standardDeserializers.string)
            .set(booleanDataType, standardDeserializers.boolean)
            .set(integerDataType, standardDeserializers.integer)
            .set(jsonDataType, (value) => JSON.parse(value as string))
    ),
    propertyValueSerializer: propertyValueSerializerFrom(
        newPropertyValueSerializerRegistry()
            .set(stringDataType, standardSerializers.string)
            .set(booleanDataType, standardSerializers.boolean)
            .set(integerDataType, standardSerializers.integer)
            .set(jsonDataType, (value) => asMinimalJsonString(value))
    ),
    classifiers: { node, inamed },
    features: { inamed_name },
    primitiveTypes: {
        stringDataType,
        booleanDataType,
        integerDataType,
        jsonDataType
    }
}

