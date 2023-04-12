import {LanguageFactory} from "./factory.ts"
import {lioncoreIdGen} from "./id-generation.ts"
import {booleanDatatype, stringDatatype} from "./builtins.ts"


const factory = new LanguageFactory("LIonCore.M3", "1", lioncoreIdGen)


/**
 * Definition of LIonCore in terms of itself.
 */
export const lioncore = factory.language


const namespaceProvider = factory.conceptInterface("NamespaceProvider")

const namespaceProvider_namespaceQualifier = factory.property(namespaceProvider, "namespaceQualifier")
    .isComputed()
    .ofType(stringDatatype)

namespaceProvider.havingFeatures(namespaceProvider_namespaceQualifier)


const namespacedEntity = factory.concept("NamespacedEntity", true)

const namespacedEntity_name = factory.property(namespacedEntity, "name")
    .ofType(stringDatatype)
    .havingKey("NamespacedEntity_name")

const namespacedEntity_key = factory.property(namespacedEntity, "key")
    .ofType(stringDatatype)
    .havingKey("NamespacedEntity_key")

const namespacedEntity_qualifiedName = factory.property(namespacedEntity, "qualifiedName")
    .isComputed()
    .ofType(stringDatatype)

namespacedEntity.havingFeatures(
        namespacedEntity_name,
        namespacedEntity_key,
        namespacedEntity_qualifiedName
    )


const language = factory.concept("Language", false)
    .implementing(namespaceProvider)

const language_name = factory.property(language, "name")
    .ofType(stringDatatype)
    .havingKey("Language_name")

const language_version = factory.property(language, "version")
    .ofType(stringDatatype)

const language_elements = factory.containment(language, "elements")
    .isOptional()
    .isMultiple()

const language_dependsOn = factory.reference(language, "dependsOn")
    .isOptional()
    .isMultiple()
    .ofType(language)

language.havingFeatures(language_name, language_version, language_elements, language_dependsOn)


const languageElement = factory.concept("LanguageElement", true, namespacedEntity)

language_elements.ofType(languageElement)


const featuresContainer = factory.concept("FeaturesContainer", true, languageElement)
    .implementing(namespaceProvider)

const featuresContainer_features = factory.containment(featuresContainer, "features")
    .isOptional()
    .isMultiple()

const featuresContainer_allFeatures = factory.reference(featuresContainer, "allFeatures")
    .isOptional()
    .isMultiple()
    .isComputed()

featuresContainer.havingFeatures(
    featuresContainer_features,
    featuresContainer_allFeatures
)


const concept = factory.concept("Concept", false, featuresContainer)

const concept_abstract = factory.property(concept, "abstract")
    .ofType(booleanDatatype)

const concept_extends = factory.reference(concept, "extends")
    .isOptional()
    .ofType(concept)
    .havingKey("Concept_extends")

const concept_implements = factory.reference(concept, "implements")
    .isOptional()
    .isMultiple()


concept.havingFeatures(
    concept_abstract,
    concept_extends,
    concept_implements
)


const conceptInterface = factory.concept("ConceptInterface", false, featuresContainer)

const conceptInterface_extends = factory.reference(conceptInterface, "extends")
    .isOptional()
    .isMultiple()
    .ofType(conceptInterface)
    .havingKey("ConceptInterface_extends")

concept_implements.ofType(conceptInterface)
conceptInterface.havingFeatures(conceptInterface_extends)


const feature = factory.concept("Feature", true, namespacedEntity)

const feature_optional = factory.property(feature, "optional")
    .ofType(booleanDatatype)

const feature_computed = factory.property(feature, "computed")
    .ofType(booleanDatatype)
    .isProgrammatic()

feature.havingFeatures(
    feature_optional,
    feature_computed
)

featuresContainer_allFeatures.type = feature
featuresContainer_features.type = feature


const link = factory.concept("Link", true, feature)

const link_multiple = factory.property(link, "multiple")
    .ofType(booleanDatatype)

const link_type = factory.reference(link, "type")
    .ofType(featuresContainer)
    .havingKey("Link_type")

link.havingFeatures(
    link_multiple,
    link_type
)


const reference = factory.concept("Reference", false, link)


const property = factory.concept("Property", false, feature)

const property_type = factory.reference(property, "type")
const property_programmatic = factory.property(property, "programmatic")
    .ofType(booleanDatatype)
    .havingKey("Property_type")

property.havingFeatures(
    property_type,
    property_programmatic
)


const dataType = factory.concept("DataType", true, languageElement)
property_type.ofType(dataType)


const primitiveType = factory.concept("PrimitiveType", false, dataType)


const containment = factory.concept("Containment", false, link)


const enumeration = factory.concept("Enumeration", false, dataType)
    .implementing(namespaceProvider)

const enumeration_literals = factory.containment(enumeration, "literals")
    .isMultiple()

const enumerationLiteral = factory.concept("EnumerationLiteral", false, namespacedEntity)

enumeration_literals.ofType(enumerationLiteral)
enumeration.havingFeatures(enumeration_literals)


lioncore.havingElements(
    namespacedEntity,
    namespaceProvider,
    language,
    languageElement,
    featuresContainer,
    concept,
    conceptInterface,
    feature,
    link,
    reference,
    property,
    dataType,
    primitiveType,
    containment,
    enumeration,
    enumerationLiteral
)


export const metaConcepts = {
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
    concept_abstract,
    concept_extends,
    concept_implements,
    conceptInterface_extends,
    enumeration_literals,
    feature_computed,
    feature_optional,
    featuresContainer_features,
    link_multiple,
    link_type,
    language_dependsOn,
    language_elements,
    language_name,
    language_version,
    namespacedEntity_name,
    property_type,
    property_programmatic,
}

