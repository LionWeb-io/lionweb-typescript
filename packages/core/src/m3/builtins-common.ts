import { StringsMapper } from "@lionweb/ts-utils"
import { Concept, Interface, Language, PrimitiveType, Property } from "./types.js"
import { PrimitiveValueDeserializerRegistry, PrimitiveValueSerializerRegistry } from "../data-types/primitive-types.js"

/**
 * The key of the LionCore language containing the built-ins.
 * (See § 3.4.2 of the meta-metamodel specification.)
 * *Note*: don’t expose from this package!
 */
export const lioncoreBuiltinsKey = "LionCore-builtins"

/**
 * The name of the LionCore language containing the built-ins.
 * (See § 3.4.2 of the meta-metamodel specification.)
 * *Note*: don’t expose from this package!
 */
export const lioncoreBuiltinsName = "LionCore_builtins"

/**
 * A key generator for entities in the LionCore built-ins language.
 * *Note*: don’t expose from this package!
 */
export const lioncoreBuiltinsKeyGenerator: StringsMapper = (...names) =>
    [lioncoreBuiltinsKey, ...names.slice(1)].join("-")

/**
 * A function that generates an ID generator for entities in the LionCore built-ins language, given a suitable postfix.
 * *Note*: don’t expose from this package!
 */
export const lioncoreBuiltinsIdGeneratorWithPostfix = (postfix: string): StringsMapper =>
    (...names) => lioncoreBuiltinsKeyGenerator(...names) + postfix

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

