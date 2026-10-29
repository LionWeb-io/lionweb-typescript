import {
    LionCoreBuiltinsFacade,
    lioncoreBuiltinsIdGeneratorWithPostfix,
    lioncoreBuiltinsKeyGenerator,
    lioncoreBuiltinsName
} from "../../builtins-common.js"
import { LanguageFactory } from "../../factory.js"
import { ConceptModifier } from "../../types.js"
import {
    newPrimitiveValueDeserializerRegistry,
    newPrimitiveValueSerializerRegistry
} from "../../../data-types/primitive-types.js"
import { standardDeserializers, standardSerializers } from "../../../data-types/standard-primitive-types.js"


const factory = new LanguageFactory(
    lioncoreBuiltinsName,
    "2026.1",
    lioncoreBuiltinsIdGeneratorWithPostfix("-2026-1"),
    lioncoreBuiltinsKeyGenerator
)
/*
 * ID == key: `LionCore-builtins-${qualified name _without_ "LionCore-builtins", dash-separated}`
 * resolveInfo: `LionWeb.LionCore_builtins.${dotted-key}` — e.g. "LionWeb.LionCore_builtins.INamed.name"
 *  where <dotted key> is the qualified name _without_ "LionCore_builtins", dot-separated.
 */


const stringDataType = factory.primitiveType("String")
const booleanDataType = factory.primitiveType("Boolean")
const integerDataType = factory.primitiveType("Integer")

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
            .seal(),
    primitiveValueSerializerRegistry:
        newPrimitiveValueSerializerRegistry()
            .register(stringDataType, standardSerializers.string)
            .register(booleanDataType, standardSerializers.boolean)
            .register(integerDataType, standardSerializers.integer)
            .seal(),
    classifiers: { node, inamed },
    features: { inamed_name },
    primitiveTypes: {
        stringDataType,
        booleanDataType,
        integerDataType
    }
}

