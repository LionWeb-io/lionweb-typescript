import { Concept, Interface, Language, Property } from "./types.js"
import { StringsMapper } from "@lionweb/ts-utils"

/**
 * The key for the LionCore language.
 */
export const lioncoreKey = "LionCore-M3"

/**
 * A key generator for the LionCore language.
 * *Note*: don’t export!
 */
export const generatedLionCoreKeyFrom: StringsMapper = (...names) =>
    names.length === 1 ? lioncoreKey : names.slice(1).join("-")


/**
 * Type def. for objects that façade (a version of) the LionCore language.
 */
export type LionCoreFacade = {
    language: Language
    metaConcepts: {
        annotation: Concept
        classifier: Concept
        concept: Concept
        interface: Concept
        containment: Concept
        enumeration: Concept
        enumerationLiteral: Concept
        ikeyed: Interface
        language: Concept
        primitiveType: Concept
        property: Concept
        reference: Concept
    }
    metaFeatures: {
        concept_abstract: Property
        ikeyed_key: Property
        language_version: Property
    }
}

