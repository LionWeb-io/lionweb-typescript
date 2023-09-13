import {LanguageFactory} from "./factory.js"
import {builtinClassifiers, builtinPrimitives} from "./builtins.js"
import {Classifier, EnumerationLiteral, Feature, lioncoreQNameSeparator} from "./types.js"
import {checkAll} from "../id-generation.js"


const lioncoreQName = "LIonCore-M3"


const factory = new LanguageFactory(
    "LIonCore.M3",
    "1",
    checkAll((qualifiedName) =>
        "-id-" +
            (qualifiedName === "LIonCore.M3"
                ? lioncoreQName
                : qualifiedName!
                    .substring(lioncoreQName.length + 1)
                    .replaceAll(".", lioncoreQNameSeparator)
            )
    ),
    (node) => {
        if (node instanceof Classifier) {
            return node.name
        }
        if (node instanceof EnumerationLiteral) {
            return `${node.enumeration.name}-${node.name}`
        }
        if (node instanceof Feature) {
            return `${node.classifier.name}-${node.name}`
        }
        throw Error(`cannot compute key for node "${node.name}" of runtime-type "${node.constructor.name}"`)
    }
)


/**
 * Definition of LIonCore in terms of itself.
 */
export const lioncore = factory.language.havingKey("LIonCore-M3")


const {inamed} = builtinClassifiers
const {booleanDatatype, stringDatatype} = builtinPrimitives


const ikeyed = factory.conceptInterface("IKeyed")
    .extending(inamed)

const ikeyed_key = factory.property(ikeyed, "key")
    .ofType(stringDatatype)

ikeyed.havingFeatures(ikeyed_key)


const feature = factory.concept("Feature", true).implementing(ikeyed)

const feature_optional = factory.property(feature, "optional")
    .ofType(booleanDatatype)

feature.havingFeatures(
    feature_optional
)


const property = factory.concept("Property", false, feature)

const property_type = factory.reference(property, "type")

property.havingFeatures(
    property_type
)


const link = factory.concept("Link", true, feature)

const link_multiple = factory.property(link, "multiple")
    .ofType(booleanDatatype)

const link_type = factory.reference(link, "type")

link.havingFeatures(
    link_multiple,
    link_type
)


const containment = factory.concept("Containment", false, link)


const reference = factory.concept("Reference", false, link)


const languageEntity = factory.concept("LanguageEntity", true)
    .implementing(ikeyed)


const classifier = factory.concept("Classifier", true, languageEntity)

const classifier_features = factory.containment(classifier, "features")
    .isOptional()
    .isMultiple()
    .ofType(feature)

classifier.havingFeatures(
    classifier_features
)

link_type.ofType(classifier)


const annotation = factory.concept("Annotation", false, classifier)

const annotation_multiple = factory.property(annotation, "multiple")
    .isOptional()
    .ofType(booleanDatatype)

const annotation_annotates = factory.reference(annotation, "annotates")
    .isOptional()
    .ofType(classifier)

const annotation_extends = factory.reference(annotation, "extends")
    .isOptional()
    .ofType(annotation)

const annotation_implements = factory.reference(annotation, "implements")
    .isMultiple()
    .isOptional()

annotation.havingFeatures(
    annotation_multiple,
    annotation_annotates,
    annotation_extends,
    annotation_implements
)


const concept = factory.concept("Concept", false, classifier)

const concept_abstract = factory.property(concept, "abstract")
    .ofType(booleanDatatype)

const concept_partition = factory.property(concept, "partition")
    .ofType(booleanDatatype)

const concept_extends = factory.reference(concept, "extends")
    .isOptional()
    .ofType(concept)

const concept_implements = factory.reference(concept, "implements")
    .isOptional()
    .isMultiple()

concept.havingFeatures(
    concept_abstract,
    concept_partition,
    concept_extends,
    concept_implements
)


const conceptInterface = factory.concept("ConceptInterface", false, classifier)

const conceptInterface_extends = factory.reference(conceptInterface, "extends")
    .isOptional()
    .isMultiple()
    .ofType(conceptInterface)

conceptInterface.havingFeatures(conceptInterface_extends)

annotation_implements.ofType(conceptInterface)
concept_implements.ofType(conceptInterface)


const dataType = factory.concept("DataType", true, languageEntity)

property_type.ofType(dataType)


const primitiveType = factory.concept("PrimitiveType", false, dataType)


const enumeration = factory.concept("Enumeration", false, dataType)

const enumeration_literals = factory.containment(enumeration, "literals")
    .isMultiple()
    .isOptional()

enumeration.havingFeatures(enumeration_literals)


const enumerationLiteral = factory.concept("EnumerationLiteral", false)
    .implementing(ikeyed)

enumeration_literals.ofType(enumerationLiteral)


const language = factory.concept("Language", false)
    .implementing(ikeyed)
    .isPartition()

const language_version = factory.property(language, "version")
    .ofType(stringDatatype)

const language_entities = factory.containment(language, "entities")
    .isOptional()
    .isMultiple()
    .ofType(languageEntity)

const language_dependsOn = factory.reference(language, "dependsOn")
    .isOptional()
    .isMultiple()
    .ofType(language)

language.havingFeatures(language_version, language_entities, language_dependsOn)


lioncore.havingEntities(
    ikeyed,
    feature,
    property,
    link,
    containment,
    reference,
    languageEntity,
    classifier,
    annotation,
    concept,
    conceptInterface,
    dataType,
    primitiveType,
    enumeration,
    enumerationLiteral,
    language
)


export const metaConcepts = {
    annotation,
    concept,
    conceptInterface,
    containment,
    enumeration,
    enumerationLiteral,
    language,
    primitiveType,
    property,
    reference
}

export const metaFeatures = {
    annotation_annotates,
    annotation_extends,
    annotation_implements,
    classifier_features,
    concept_abstract,
    concept_partition,
    concept_extends,
    concept_implements,
    conceptInterface_extends,
    enumeration_literals,
    feature_optional,
    ikeyed_key,
    language_dependsOn,
    language_entities,
    language_version,
    link_multiple,
    link_type,
    property_type
}

export {lioncoreQName}

