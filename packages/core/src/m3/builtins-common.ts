import { StringsMapper } from "@lionweb/ts-utils"
import { Concept, Interface, Language, PrimitiveType, Property } from "./types.js"
import { PrimitiveValueDeserializerRegistry, PrimitiveValueSerializerRegistry } from "../data-types/primitive-types.js"

/**
 * The key of the LionCore language containing the built-ins.
 */
export const lioncoreBuiltinsKey = "LionCore-builtins"

/**
 * A function that generates IDs and keys for entities in the LionCore built-ins language.
 */
export const lioncoreBuiltinsIdAndKeyGenerator: StringsMapper = (...names) =>
    [lioncoreBuiltinsKey, ...names.slice(1)].join("-")


/**
 * Type def. for objects that façade (a version of) the LionCore built-ins.
 */
export type LionCoreBuiltinsFacade = {
    language: Language
    primitiveValueDeserializerRegistry: PrimitiveValueDeserializerRegistry
    primitiveValueSerializerRegistry: PrimitiveValueSerializerRegistry
    classifiers: {
        node: Concept
        inamed: Interface
    }
    features: {
        inamed_name: Property
    }
    /**
     * The built-in primitive types: boolean, integer, string + legacy (in the `Record<...>` part).
     */
    primitiveTypes: {
        booleanDataType: PrimitiveType
        integerDataType: PrimitiveType
        stringDataType: PrimitiveType
    } & Record<string, PrimitiveType>
}

