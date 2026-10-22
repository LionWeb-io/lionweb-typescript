import { asMinimalJsonString } from "@lionweb/ts-utils"
import { LionCoreBuiltinsFacade, lioncoreBuiltinsIdAndKeyGenerator } from "../../builtins-common.js"
import { LanguageFactory } from "../../factory.js"
import { ConceptModifier } from "../../types.js"
import { standardDeserializers, standardSerializers } from "../../../data-types/standard-primitive-types.js"
import {
    newPrimitiveValueDeserializerRegistry,
    newPrimitiveValueSerializerRegistry
} from "../../../data-types/primitive-types.js"


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
    primitiveValueDeserializerRegistry:
        newPrimitiveValueDeserializerRegistry()
            .register(stringDataType, standardDeserializers.string)
            .register(booleanDataType, standardDeserializers.boolean)
            .register(integerDataType, standardDeserializers.integer)
            .register(jsonDataType, (value) => JSON.parse(value as string))
            .seal(),
    primitiveValueSerializerRegistry:
        newPrimitiveValueSerializerRegistry()
            .register(stringDataType, standardSerializers.string)
            .register(booleanDataType, standardSerializers.boolean)
            .register(integerDataType, standardSerializers.integer)
            .register(jsonDataType, (value) => asMinimalJsonString(value))
            .seal(),
    classifiers: { node, inamed },
    features: { inamed_name },
    primitiveTypes: {
        stringDataType,
        booleanDataType,
        integerDataType,
        jsonDataType
    }
}

