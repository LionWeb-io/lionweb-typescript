import {nanoid} from "npm:nanoid@4.0.0"

import {
    Concept,
    ConceptInterface,
    Containment,
    Enumeration,
    EnumerationLiteral,
    Metamodel,
    PrimitiveType,
    Property,
    Reference
} from "../types.ts"


// Definition of LIonCore in terms of itself.


export const lioncore = new Metamodel("lioncore", nanoid())


const stringDatatype = new PrimitiveType(lioncore, "String", nanoid())


const booleanDatatype = new PrimitiveType(lioncore, "boolean", nanoid())


const intDatatype = new PrimitiveType(lioncore, "int", nanoid())


const jsonDatatype = new PrimitiveType(lioncore, "JSON", nanoid())


const namespaceProvider = new ConceptInterface(lioncore, "NamespaceProvider", nanoid())

const namespaceProvider_namespaceQualifier = new Property(namespaceProvider, "namespaceQualifier", nanoid())
    .isDerived()
    .ofType(stringDatatype)

namespaceProvider.havingFeatures(namespaceProvider_namespaceQualifier)


const namespacedEntity = new Concept(lioncore, "NamespacedEntity", nanoid(), true)

const namespacedEntity_simpleName = new Property(namespacedEntity, "simpleName", nanoid())
    .ofType(stringDatatype)

const namespacedEntity_qualifiedName = new Property(namespacedEntity, "qualifiedName", nanoid())
    .isDerived()
    .ofType(stringDatatype)

const namespacedEntity_container = new Reference(namespacedEntity, "container", nanoid())
    .ofType(namespaceProvider)

namespacedEntity.havingFeatures(
        namespacedEntity_simpleName,
        namespacedEntity_qualifiedName,
        namespacedEntity_container
    )


const metamodel = new Concept(lioncore, "Metamodel", nanoid(), false)
    .implementing(namespaceProvider)

const metamodel_qualifiedName = new Property(metamodel, "qualifiedName", nanoid())
    .ofType(stringDatatype)

const metamodel_elements = new Containment (metamodel, "elements", nanoid())
    .isOptional()
    .isMultiple()

const metamodel_dependsOn = new Reference(metamodel, "dependsOn", nanoid())
    .isOptional()
    .isMultiple()
    .ofType(metamodel)

metamodel.havingFeatures(metamodel_qualifiedName, metamodel_elements, metamodel_dependsOn)


const metamodelElement = new Concept(lioncore, "MetamodelElement", nanoid(), true, namespacedEntity)

metamodel_elements.ofType(metamodelElement)


const featuresContainer = new Concept(lioncore, "FeaturesContainer", nanoid(), true, metamodelElement)
    .implementing(namespaceProvider)

const featuresContainer_features = new Containment(featuresContainer, "features", nanoid())
    .isOptional()
    .isMultiple()

const featuresContainer_allFeatures = new Reference(featuresContainer, "allFeatures", nanoid())
    .isOptional()
    .isMultiple()
    .isDerived()

featuresContainer.havingFeatures(
    featuresContainer_features,
    featuresContainer_allFeatures
)


const concept = new Concept(lioncore, "Concept", nanoid(), false, featuresContainer)

const concept_abstract = new Property(concept, "abstract", nanoid())
    .ofType(booleanDatatype)

const concept_extends = new Reference(concept, "extends", nanoid())
    .isOptional()
    .ofType(concept)

const concept_implements = new Reference(concept, "implements", nanoid())
    .isOptional()
    .isMultiple()


concept.havingFeatures(
    concept_abstract,
    concept_extends,
    concept_implements
)


const conceptInterface = new Concept(lioncore, "ConceptInterface", nanoid(), false, featuresContainer)

const conceptInterface_extends = new Reference(conceptInterface, "extends", nanoid())
    .isOptional()
    .isMultiple()
    .ofType(conceptInterface)

concept_implements.ofType(conceptInterface)
conceptInterface.havingFeatures(conceptInterface_extends)


const feature = new Concept(lioncore, "Feature", nanoid(), true, namespacedEntity)

const feature_optional = new Property(feature, "optional", nanoid())
    .ofType(booleanDatatype)

const feature_derived = new Property(feature, "derived", nanoid())
    .ofType(booleanDatatype)

feature.havingFeatures(
    feature_optional,
    feature_derived
)

featuresContainer_allFeatures.type = feature
featuresContainer_features.type = feature


const link = new Concept(lioncore, "Link", nanoid(), true, feature)

const link_multiple = new Property(link, "multiple", nanoid())
    .ofType(booleanDatatype)

const link_type = new Reference(link, "type", nanoid())
    .ofType(featuresContainer)

link.havingFeatures(
    link_multiple,
    link_type
)


const reference = new Concept(lioncore, "Reference", nanoid(), false, link)

const reference_specializes = new Reference(reference, "specializes", nanoid())
    .isOptional()
    .ofType(reference)

reference.havingFeatures(reference_specializes)


const property = new Concept(lioncore, "Property", nanoid(), false, feature)

const property_type = new Reference(property, "type", nanoid())

property.havingFeatures(property_type)


const dataType = new Concept(lioncore, "DataType", nanoid(), true, metamodelElement)
property_type.ofType(dataType)


const primitiveType = new Concept(lioncore, "PrimitiveType", nanoid(), false, dataType)


const containment = new Concept(lioncore, "Containment", nanoid(), false, link)

const containment_specializes = new Reference(containment, "specializes", nanoid())
    .isOptional()
    .ofType(containment)

containment.havingFeatures(containment_specializes)


const enumeration = new Concept(lioncore, "Enumeration", nanoid(), false, dataType)
    .implementing(namespaceProvider)

const enumeration_literals = new Containment(enumeration, "literals", nanoid())
    .isMultiple()

const enumerationLiteral = new Concept(lioncore, "EnumerationLiteral", nanoid(), false, namespacedEntity)

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
    // built-ins:
    stringDatatype,
    booleanDatatype,
    intDatatype,
    jsonDatatype
)

