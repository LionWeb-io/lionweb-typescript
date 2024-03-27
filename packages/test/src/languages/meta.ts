import { builtinPrimitives, concatenator, LanguageFactory, lastOf } from "@lionweb/core"

const factory = new LanguageFactory(
    "meta",
    "1",
    concatenator("-"),
    lastOf
)

/**
 * A "meta" language in which every instance of a meta concept has name "{A|a}[n]<name of meta concept>".
 * This is useful to test {@link ClassifierDeducer classifier deducers} with.
 */
export const metaLanguage = factory.language

const anAnnotation = factory.annotation("AnAnnotation")

const aConcept = factory.concept("AConcept", false)
const aProperty = factory.property(aConcept, "aProperty").ofType(builtinPrimitives.jsonDatatype)
const aContainment = factory.containment(aConcept, "aContainment").ofType(aConcept)
const aReference = factory.reference(aConcept, "aReference").ofType(aConcept)
aConcept.havingFeatures(aProperty, aContainment, aReference)

const anEnumeration = factory.enumeration("AnEnumeration")
const anEnumerationLiteral = factory.enumerationLiteral(anEnumeration, "anEnumerationLiteral")
anEnumeration.havingLiterals(anEnumerationLiteral)

const anInterface = factory.interface("AnInterface")

metaLanguage.havingEntities(anAnnotation, aConcept, anEnumeration, anInterface)

