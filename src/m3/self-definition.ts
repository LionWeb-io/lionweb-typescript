import {MetamodelFactory} from "./factory.ts"
import {hashingIdGen} from "../id-generation.ts"


// Definition of LIonCore in terms of itself.

const factory = new MetamodelFactory("LIonCore", hashingIdGen({
    salt: "LIonCore",
    algorithm: "MD5",
        // Note: MD5 is not secure for cryptographic purposes, but it's OK for hashing,
        // and it produces hashes of only 128 bits.
    checkForUniqueHash: true
}))
export const lioncore = factory.metamodel


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

export const namespacedEntity_simpleName = factory.property(namespacedEntity, "simpleName")
    .ofType(stringDatatype)

const namespacedEntity_qualifiedName = factory.property(namespacedEntity, "qualifiedName")
    .isDerived()
    .ofType(stringDatatype)

const namespacedEntity_container = factory.reference(namespacedEntity, "container")
    .ofType(namespaceProvider)

namespacedEntity.havingFeatures(
        namespacedEntity_simpleName,
        namespacedEntity_qualifiedName,
        namespacedEntity_container
    )


export const metamodel = factory.concept("Metamodel", false)
    .implementing(namespaceProvider)

export const metamodel_qualifiedName = factory.property(metamodel, "qualifiedName")
    .ofType(stringDatatype)

export const metamodel_elements = factory.containment(metamodel, "elements")
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

export const featuresContainer_features = factory.containment(featuresContainer, "features")
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


export const concept = factory.concept("Concept", false, featuresContainer)

export const concept_abstract = factory.property(concept, "abstract")
    .ofType(booleanDatatype)

export const concept_extends = factory.reference(concept, "extends")
    .isOptional()
    .ofType(concept)

export const concept_implements = factory.reference(concept, "implements")
    .isOptional()
    .isMultiple()


concept.havingFeatures(
    concept_abstract,
    concept_extends,
    concept_implements
)


export const conceptInterface = factory.concept("ConceptInterface", false, featuresContainer)

export const conceptInterface_extends = factory.reference(conceptInterface, "extends")
    .isOptional()
    .isMultiple()
    .ofType(conceptInterface)

concept_implements.ofType(conceptInterface)
conceptInterface.havingFeatures(conceptInterface_extends)


const feature = factory.concept("Feature", true, namespacedEntity)

export const feature_optional = factory.property(feature, "optional")
    .ofType(booleanDatatype)

export const feature_derived = factory.property(feature, "derived")
    .ofType(booleanDatatype)
    .isDisputed()

feature.havingFeatures(
    feature_optional,
    feature_derived
)

featuresContainer_allFeatures.type = feature
featuresContainer_features.type = feature


const link = factory.concept("Link", true, feature)

export const link_multiple = factory.property(link, "multiple")
    .ofType(booleanDatatype)

export const link_type = factory.reference(link, "type")
    .ofType(featuresContainer)

link.havingFeatures(
    link_multiple,
    link_type
)


export const reference = factory.concept("Reference", false, link)


export const property = factory.concept("Property", false, feature)

export const property_type = factory.reference(property, "type")
export const property_disputed = factory.property(property, "disputed")
    .ofType(booleanDatatype)

property.havingFeatures(
    property_type,
    property_disputed
)


const dataType = factory.concept("DataType", true, metamodelElement)
property_type.ofType(dataType)


export const primitiveType = factory.concept("PrimitiveType", false, dataType)


export const containment = factory.concept("Containment", false, link)


export const enumeration = factory.concept("Enumeration", false, dataType)
    .implementing(namespaceProvider)

export const enumeration_literals = factory.containment(enumeration, "literals")
    .isMultiple()

export const enumerationLiteral = factory.concept("EnumerationLiteral", false, namespacedEntity)

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


// TODO  expose meta concepts separately

