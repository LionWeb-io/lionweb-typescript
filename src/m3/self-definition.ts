import {MetamodelFactory} from "./factory.ts"
import {lioncoreIdGen} from "./id-generation.ts"


const factory = new MetamodelFactory("LIonCore.M3", lioncoreIdGen)


/**
 * Definition of LIonCore in terms of itself.
 */
export const lioncore = factory.metamodel


// TODO  use stdlib instead:

const stringDatatype = factory.primitiveType("String")


const booleanDatatype = factory.primitiveType("boolean")


const intDatatype = factory.primitiveType("int")


const jsonDatatype = factory.primitiveType("JSON")


const namespaceProvider = factory.conceptInterface("NamespaceProvider")

const namespaceProvider_namespaceQualifier = factory.property(namespaceProvider, "namespaceQualifier")
    .isDerived()
    .ofType(stringDatatype)

namespaceProvider.havingFeatures(namespaceProvider_namespaceQualifier)


const namespacedEntity = factory.concept("NamespacedEntity", true)

const namespacedEntity_simpleName = factory.property(namespacedEntity, "simpleName")
    .ofType(stringDatatype)

const namespacedEntity_qualifiedName = factory.property(namespacedEntity, "qualifiedName")
    .isDerived()
    .ofType(stringDatatype)

namespacedEntity.havingFeatures(
        namespacedEntity_simpleName,
        namespacedEntity_qualifiedName
    )


const metamodel = factory.concept("Metamodel", false)
    .implementing(namespaceProvider)

const metamodel_qualifiedName = factory.property(metamodel, "qualifiedName")
    .ofType(stringDatatype)

const metamodel_elements = factory.containment(metamodel, "elements")
    .isOptional()
    .isMultiple()

const metamodel_dependsOn = factory.reference(metamodel, "dependsOn")
    .isOptional()
    .isMultiple()
    .ofType(metamodel)

metamodel.havingFeatures(metamodel_qualifiedName, metamodel_elements, metamodel_dependsOn)


const metamodelElement = factory.concept("MetamodelElement", true, namespacedEntity)

metamodel_elements.ofType(metamodelElement)


const featuresContainer = factory.concept("FeaturesContainer", true, metamodelElement)
    .implementing(namespaceProvider)

const featuresContainer_features = factory.containment(featuresContainer, "features")
    .isOptional()
    .isMultiple()

const featuresContainer_allFeatures = factory.reference(featuresContainer, "allFeatures")
    .isOptional()
    .isMultiple()
    .isDerived()

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

concept_implements.ofType(conceptInterface)
conceptInterface.havingFeatures(conceptInterface_extends)


const feature = factory.concept("Feature", true, namespacedEntity)

const feature_optional = factory.property(feature, "optional")
    .ofType(booleanDatatype)

const feature_derived = factory.property(feature, "derived")
    .ofType(booleanDatatype)
    .isDisputed()

feature.havingFeatures(
    feature_optional,
    feature_derived
)

featuresContainer_allFeatures.type = feature
featuresContainer_features.type = feature


const link = factory.concept("Link", true, feature)

const link_multiple = factory.property(link, "multiple")
    .ofType(booleanDatatype)

const link_type = factory.reference(link, "type")
    .ofType(featuresContainer)

link.havingFeatures(
    link_multiple,
    link_type
)


const reference = factory.concept("Reference", false, link)


const property = factory.concept("Property", false, feature)

const property_type = factory.reference(property, "type")
const property_disputed = factory.property(property, "disputed")
    .ofType(booleanDatatype)

property.havingFeatures(
    property_type,
    property_disputed
)


const dataType = factory.concept("DataType", true, metamodelElement)
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
    metamodel,
    metamodelElement,
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
    enumerationLiteral,
    // built-ins:
    stringDatatype,
    booleanDatatype,
    intDatatype,
    jsonDatatype
)


export const metaConcepts = {
    concept,
    conceptInterface,
    containment,
    enumeration,
    enumerationLiteral,
    metamodel,
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
    feature_derived,
    feature_optional,
    featuresContainer_features,
    link_multiple,
    link_type,
    metamodel_elements,
    metamodel_qualifiedName,
    namespacedEntity_simpleName,
    property_type,
    property_disputed,
}

