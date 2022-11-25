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


export const lioncore = new Metamodel("lioncore")


const stringDatatype = new PrimitiveType(lioncore, "String")


const booleanDatatype = new PrimitiveType(lioncore, "boolean")


const namespaceProvider = new ConceptInterface(lioncore, "NamespaceProvider")

const namespaceProvider_namespaceQualifier = new Property(namespaceProvider, "namespaceQualifier")
    .isDerived()
    .ofType(stringDatatype)

namespaceProvider.havingFeatures(namespaceProvider_namespaceQualifier)


const namespacedEntity = new Concept(lioncore, "NamespacedEntity", true)

const namespacedEntity_simpleName = new Property(namespacedEntity, "simpleName")
    .ofType(stringDatatype)

const namespacedEntity_qualifiedName = new Property(namespacedEntity, "qualifiedName")
    .isDerived()
    .ofType(stringDatatype)

const namespacedEntity_container = new Reference(namespacedEntity, "container")
    .ofType(namespaceProvider)

namespacedEntity.havingFeatures(
        namespacedEntity_simpleName,
        namespacedEntity_qualifiedName,
        namespacedEntity_container
    )


const metamodel = new Concept(lioncore, "Metamodel", false)
    .implementing(namespaceProvider)

const metamodel_qualifiedName = new Property(metamodel, "qualifiedName")
    .ofType(stringDatatype)

const metamodel_elements = new Containment (metamodel, "elements")
    .isOptional()
    .isMultiple()

const metamodel_dependsOn = new Reference(metamodel, "dependsOn")
    .isOptional()
    .isMultiple()
    .ofType(metamodel)

metamodel.havingFeatures(metamodel_qualifiedName, metamodel_elements, metamodel_dependsOn)


const metamodelElement = new Concept(lioncore, "MetamodelElement", true, namespacedEntity)

metamodel_elements.ofType(metamodelElement)


const featuresContainer = new Concept(lioncore, "FeaturesContainer", true, metamodelElement)
    .implementing(namespaceProvider)

const featuresContainer_features = new Containment(featuresContainer, "features")
    .isOptional()
    .isMultiple()

const featuresContainer_allFeatures = new Reference(featuresContainer, "allFeatures")
    .isOptional()
    .isMultiple()
    .isDerived()

featuresContainer.havingFeatures(
    featuresContainer_features,
    featuresContainer_allFeatures
)


const concept = new Concept(lioncore, "Concept", false, featuresContainer)

const concept_abstract = new Property(concept, "abstract")
    .ofType(booleanDatatype)

const concept_extends = new Reference(concept, "extends")
    .isOptional()
    .ofType(concept)

const concept_implements = new Reference(concept, "implements")
    .isOptional()
    .isMultiple()


concept.havingFeatures(
    concept_abstract,
    concept_extends,
    concept_implements
)


const conceptInterface = new Concept(lioncore, "ConceptInterface", false, featuresContainer)

const conceptInterface_extends = new Reference(conceptInterface, "extends")
    .isOptional()
    .isMultiple()
    .ofType(conceptInterface)

concept_implements.ofType(conceptInterface)
conceptInterface.havingFeatures(conceptInterface_extends)


const feature = new Concept(lioncore, "Feature", true, namespacedEntity)

const feature_optional = new Property(feature, "optional")
    .ofType(booleanDatatype)

const feature_derived = new Property(feature, "derived")
    .ofType(booleanDatatype)

feature.havingFeatures(
    feature_optional,
    feature_derived
)

featuresContainer_allFeatures.type = feature
featuresContainer_features.type = feature


const link = new Concept(lioncore, "Link", true, feature)

const link_multiple = new Property(link, "multiple")
    .ofType(booleanDatatype)

const link_type = new Reference(link, "type")
    .ofType(featuresContainer)

link.havingFeatures(
    link_multiple,
    link_type
)


const reference = new Concept(lioncore, "Reference", false, link)

const reference_specializes = new Reference(reference, "specializes")
    .isOptional()
    .ofType(reference)

reference.havingFeatures(reference_specializes)


const property = new Concept(lioncore, "Property", false, feature)

const property_type = new Reference(property, "type")

property.havingFeatures(property_type)


const datatype = new Concept(lioncore, "Datatype", true, metamodelElement)
property_type.ofType(datatype)


const primitiveType = new Concept(lioncore, "PrimitiveType", false, datatype)


const typedef = new Concept(lioncore, "Typedef", false, datatype)

const typedef_constraints = new Reference(typedef, "constraints")
    .ofType(primitiveType)

typedef.havingFeatures(typedef_constraints)


const containment = new Concept(lioncore, "Containment", false, link)

const containment_specializes = new Reference(containment, "specializes")
    .isOptional()
    .ofType(containment)

containment.havingFeatures(containment_specializes)


const enumeration = new Concept(lioncore, "Enumeration", false, datatype)
    .implementing(namespaceProvider)

const enumeration_literals = new Containment(enumeration, "literals")
    .isMultiple()

const enumerationLiteral = new Concept(lioncore, "EnumerationLiteral", false, namespacedEntity)

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
    datatype,
    primitiveType,
    typedef,
    containment,
    enumeration,
    // built-ins:
    booleanDatatype,
    stringDatatype
)

