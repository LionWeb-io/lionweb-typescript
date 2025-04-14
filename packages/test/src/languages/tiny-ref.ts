import { LanguageFactory } from "@lionweb/core"
import { chain, concatenator, lastOf } from "@lionweb/ts-utils"
import { hasher } from "@lionweb/utilities"

const factory = new LanguageFactory("TinyRef", "0", chain(concatenator("-"), hasher({ encoding: "base64" })), lastOf)
export const tinyRefLanguage = factory.language

export const MyConcept = factory.concept("MyConcept", false)
export const MyConcept_singularRef = factory.reference(MyConcept, "singularRef").ofType(MyConcept)
export const MyConcept_multivaluedRef = factory.reference(MyConcept, "multivaluedRef").ofType(MyConcept).isMultiple()
MyConcept.havingFeatures(MyConcept_singularRef, MyConcept_multivaluedRef)
