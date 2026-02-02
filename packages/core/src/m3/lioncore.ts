import { lioncoreBuiltinsFacade } from "./builtins.js"
import { LanguageFactory } from "./factory.js"
import { generatedLionCoreKeyFrom, LionCoreFacade } from "./lioncore-common.js"


const factory = new LanguageFactory(
    "LionCore_M3",
    "2023.1",
    (...names) => "-id-" + generatedLionCoreKeyFrom(...names),
    generatedLionCoreKeyFrom
)
/*
 * ID: `-id-${key}`
 * key: qualified name _without_ "LionCore_M3", dash-separated
 */

/**
 * Definition of LionCore in terms of itself.
 *
 * @deprecated Use {@code lioncoreFacade.language} instead.
 */
export const lioncore = factory.language.havingKey("LionCore-M3")

const { inamed } = lioncoreBuiltinsFacade.classifiers
const { booleanDataType, stringDataType } = lioncoreBuiltinsFacade.primitiveTypes

const ikeyed = factory.interface("IKeyed").extending(inamed)
const ikeyed_key = factory.property(ikeyed, "key").ofType(stringDataType)

const feature = factory.concept("Feature", true).implementing(ikeyed)
factory.property(feature, "optional").ofType(booleanDataType)

const property = factory.concept("Property", false, feature)
const property_type = factory.reference(property, "type")

const link = factory.concept("Link", true, feature)
factory.property(link, "multiple").ofType(booleanDataType)
const link_type = factory.reference(link, "type")

const containment = factory.concept("Containment", false, link)

const reference = factory.concept("Reference", false, link)

const languageEntity = factory.concept("LanguageEntity", true).implementing(ikeyed)

const classifier = factory.concept("Classifier", true, languageEntity)
factory.containment(classifier, "features").isOptional().isMultiple().ofType(feature)
link_type.ofType(classifier)

const annotation = factory.concept("Annotation", false, classifier)
factory.reference(annotation, "annotates").isOptional().ofType(classifier)
factory.reference(annotation, "extends").isOptional().ofType(annotation)
const annotation_implements = factory.reference(annotation, "implements").isMultiple().isOptional()

const concept = factory.concept("Concept", false, classifier)
const concept_abstract = factory.property(concept, "abstract").ofType(booleanDataType)
factory.property(concept, "partition").ofType(booleanDataType)
factory.reference(concept, "extends").isOptional().ofType(concept)
const concept_implements = factory.reference(concept, "implements").isOptional().isMultiple()

const interface_ = factory.concept("Interface", false, classifier)
factory.reference(interface_, "extends").isOptional().isMultiple().ofType(interface_)

annotation_implements.ofType(interface_)
concept_implements.ofType(interface_)

const dataType = factory.concept("DataType", true, languageEntity)
property_type.ofType(dataType)

const primitiveType = factory.concept("PrimitiveType", false, dataType)

const enumeration = factory.concept("Enumeration", false, dataType)
const enumeration_literals = factory.containment(enumeration, "literals").isMultiple().isOptional()
const enumerationLiteral = factory.concept("EnumerationLiteral", false).implementing(ikeyed)
enumeration_literals.ofType(enumerationLiteral)

const language = factory.concept("Language", false).implementing(ikeyed).isPartition()
const language_version = factory.property(language, "version").ofType(stringDataType)
factory.containment(language, "entities").isOptional().isMultiple().ofType(languageEntity)
factory.reference(language, "dependsOn").isOptional().isMultiple().ofType(language)


export const lioncoreFacade: LionCoreFacade = {
    language: factory.language,
    metaConcepts: {
        annotation,
        classifier,
        concept,
        interface: interface_,
        containment,
        enumeration,
        enumerationLiteral,
        ikeyed,
        language,
        primitiveType,
        property,
        reference
    },
    metaFeatures: {
        concept_abstract,
        ikeyed_key,
        language_version
    }
}


/**
 * @deprecated Use {@code <LionWeb version>.lioncoreFacade.metaConcepts} instead.
 */
export const metaConcepts = lioncoreFacade.metaConcepts

/**
 * @deprecated Use {@code <LionWeb version>.lioncoreFacade.metaFeatures} instead.
 */
export const metaFeatures = lioncoreFacade.metaFeatures

