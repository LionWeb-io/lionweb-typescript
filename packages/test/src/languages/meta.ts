import { builtinPrimitives, LanguageFactory } from "@lionweb/core"
import { concatenator, lastOf } from "@lionweb/ts-utils"

const factory = new LanguageFactory("meta", "1", concatenator("-"), lastOf)

/**
 * A "meta" language in which every instance of a meta concept has name "{A|a}[n]<name of meta concept>".
 * This is useful to test {@link ClassifierDeducer classifier deducers} and {@link FeatureResolvers feature resolvers} with.
 */
export const metaLanguage = factory.language

factory.annotation("AnAnnotation")

export const aConcept = factory.concept("AConcept", false)
export const aConcept_aProperty = factory.property(aConcept, "aProperty").ofType(builtinPrimitives.jsonDataType)
export const aConcept_aContainment = factory.containment(aConcept, "aContainment").ofType(aConcept)
export const aConcept_aReference = factory.reference(aConcept, "aReference").ofType(aConcept)

export const anEnumeration = factory.enumeration("AnEnumeration")
factory.enumerationLiteral(anEnumeration, "anEnumerationLiteral")

export const anInterface = factory.interface("AnInterface")

