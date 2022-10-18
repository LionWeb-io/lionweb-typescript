import {
    Concept,
    ConceptInterface,
    Containment,
    Enumeration,
    EnumerationLiteral,
    Metamodel,
    Multiplicity,
    PrimitiveType,
    Property,
    Reference
} from "./types.ts"


// Definition of LIonCore in terms of itself.


const stringDatatype = new PrimitiveType("String")

const booleanDatatype = new PrimitiveType("boolean")


const namespaceProvider_namespaceQualifier = new Property("namespaceQualifier", Multiplicity.Single).isDerived().ofType(stringDatatype)

const namespaceProvider = new ConceptInterface("NamespaceProvider")
    .havingFeatures(namespaceProvider_namespaceQualifier)


const namespacedEntity_simpleName = new Property("simpleName", Multiplicity.Single).ofType(stringDatatype)

const namespacedEntity_qualifiedName = new Property("qualifiedName", Multiplicity.Single).isDerived().ofType(stringDatatype)

const namespacedEntity_container = new Reference("container", Multiplicity.Single)
namespacedEntity_container.type = namespaceProvider

const namespacedEntity = new ConceptInterface("NamespacedEntity")
    .havingFeatures(
        namespacedEntity_simpleName,
        namespacedEntity_qualifiedName,
        namespacedEntity_container
    )


const metamodel_qualifiedName = new Property("qualifiedName", Multiplicity.Single).ofType(stringDatatype)

const metamodel_elements = new Containment ("elements", Multiplicity.ZeroOrMore)

const metamodel_dependsOn = new Reference("dependsOn", Multiplicity.ZeroOrMore)

const metamodel = new Concept("Metamodel", false)
    .havingFeatures(metamodel_qualifiedName, metamodel_elements, metamodel_dependsOn)
metamodel.implements.push(namespaceProvider)
metamodel_dependsOn.type = metamodel

const metamodelElement = new Concept("MetamodelElement", true)
metamodelElement.implements.push(namespacedEntity)


const abstractConcept_allFeatures = new Reference("allFeatures", Multiplicity.ZeroOrMore).isDerived()

const abstractConcept = new Concept("AbstractConcept", true, metamodelElement)
    .havingFeatures(abstractConcept_allFeatures)
abstractConcept.implements.push(namespaceProvider)

const concept_abstract = new Property("abstract", Multiplicity.Single).ofType(booleanDatatype)

const concept_extends = new Reference("extends", Multiplicity.Optional)

const concept_implements = new Reference("implements", Multiplicity.ZeroOrMore)

const concept = new Concept("Concept", false, abstractConcept)
    .havingFeatures(
        concept_abstract,
        concept_extends,
        concept_implements
    )
concept_extends.type = concept


const conceptInterface_extends = new Reference("extends", Multiplicity.ZeroOrMore)

const conceptInterface = new Concept("ConceptInterface", false, abstractConcept)
    .havingFeatures(conceptInterface_extends)

conceptInterface_extends.type = conceptInterface
concept_implements.type = conceptInterface


const annotation_platformSpecific = new Property("platformSpecific", Multiplicity.Optional).ofType(stringDatatype)

const annotation_target = new Reference("target", Multiplicity.Single).ofType(abstractConcept)

const annotation = new Concept("Annotation", false, abstractConcept)
    .havingFeatures(
        annotation_platformSpecific,
        annotation_target
    )
annotation.implements.push(namespaceProvider)

const featuresContainer_features = new Containment("features", Multiplicity.ZeroOrMore)

const featuresContainer = new ConceptInterface("FeaturesContainer")
featuresContainer.features.push(featuresContainer_features)

abstractConcept.implements.push(featuresContainer)


const multiplicity = new Enumeration("Multiplicity")
multiplicity.literals.push(
    new EnumerationLiteral("Optional"),
    new EnumerationLiteral("Single"),
    new EnumerationLiteral("ZeroOrMore"),
    new EnumerationLiteral("OneOrMore")
)


const feature_multiplicity = new Property("multiplicity", Multiplicity.Single).ofType(multiplicity)

const feature_derived = new Property("derived", Multiplicity.Single).ofType(booleanDatatype)

const feature = new Concept("Feature", true)
    .havingFeatures(
        feature_multiplicity,
        feature_derived
    )
feature.implements.push(namespacedEntity)

abstractConcept_allFeatures.type = feature
featuresContainer_features.type = feature


const link_type = new Reference("type", Multiplicity.Single).ofType(abstractConcept)

const link = new Concept("Link", true, feature)
    .havingFeatures(link_type)


const reference_specializes = new Reference("specializes", Multiplicity.ZeroOrMore)

const reference = new Concept("Reference", false, link)
    .havingFeatures(reference_specializes)
reference_specializes.type = reference


const property_type = new Reference("type", Multiplicity.Single)

const property = new Concept("Property", false, feature)
    .havingFeatures(property_type)


const datatype = new Concept("Datatype", true, metamodelElement)
property_type.type = datatype


const primitiveType_constraints = new Containment("constraints", Multiplicity.ZeroOrMore)

const primitiveType = new Concept("PrimitiveType", false, datatype)
    .havingFeatures(primitiveType_constraints)


const typedef = new Concept("Typedef", false, datatype)

primitiveType_constraints.type = typedef


const containment_specializes = new Reference("specializes", Multiplicity.ZeroOrMore)

const containment = new Concept("Containment", false, link)
    .havingFeatures(containment_specializes)

containment_specializes.type = containment  // (ref#11)


metamodel_elements.type = metamodelElement

export const lioncore = new Metamodel("lioncore")
    .havingElements(
        namespacedEntity,
        namespaceProvider,
        metamodel,
        metamodelElement,
        abstractConcept,
        concept,
        conceptInterface,
        annotation,
        featuresContainer,
        feature,
        link,
        reference,
        property,
        datatype,
        primitiveType,
        typedef,
        containment,
        multiplicity,
        // built-ins:
        booleanDatatype,
        stringDatatype
    )

