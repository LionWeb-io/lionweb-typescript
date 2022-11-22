import {asString, indentWith, NestedString} from "npm:littoral-templates"

import {
    Concept,
    ConceptInterface,
    Containment,
    Enumeration,
    Feature,
    Link,
    Metamodel,
    MetamodelElement,
    PrimitiveType
} from "../types.ts"
import {
    elementsSortedByName,
    nonRelationalFeatures,
    relationsOf,
    type
} from "../functions.ts"
import {isRef, unresolved} from "../../references.ts"


// define some layouting basics/building algebra:

const indented = indentWith(`  `)(1)

const block = (header: string, elements: NestedString): NestedString =>
    elements.length === 0
        ? header
        : [
            `${header} {`,
            indented(elements),
            `}`
        ]

const withNewLine = (content: NestedString): NestedString =>
    [
        content,
        ``
    ]


export const generateMermaidForMetamodel = ({qualifiedName, elements}: Metamodel) =>
    asString([
        "```mermaid",
        `---
title: ${qualifiedName}
---
classDiagram

`,
        indented(elementsSortedByName(elements).map(generateForMetamodelElement)),
        ``,
        indented(elementsSortedByName(elements).map(generateForRelationsOf)),
        ``,
        "```"
    ])


const generateForEnumeration = ({simpleName, literals}: Enumeration) =>
    withNewLine(block(
        `class ${simpleName}`,
        [
            `<<enumeration>>`,
            literals.map(({simpleName}) => simpleName)
        ]
    ))


const generateForConcept = ({simpleName, features, abstract: abstract_, extends: extends_, implements: implements_}: Concept) =>
    [
        block(
            `class ${simpleName}`,
            nonRelationalFeatures(features).map(generateForNonRelationalFeature)
        ),
        abstract_ ? `<<Abstract>> ${simpleName}` : [],
        isRef(extends_) ? `${extends_.simpleName} <|-- ${simpleName}` : [],
        ``
    ]


const generateForConceptInterface = ({simpleName, features, extends: extends_}: ConceptInterface) =>
    [
        block(
            `class ${simpleName}`,
            nonRelationalFeatures(features).map(generateForNonRelationalFeature)
        ),
        `<<Interface>> ${simpleName}`,
        extends_.map(({simpleName: extendsName}) => `${extendsName} <|-- ${simpleName}`),
        ``
    ]


const generateForNonRelationalFeature = (feature: Feature) => {
    const {simpleName, optional, derived} = feature
    const multiple = feature instanceof Link && feature.multiple
    const type_ = type(feature)
    const typeText = `${multiple ? `List~` : ``}${type_ === unresolved ? `???` : type_.simpleName}${multiple ? `~` : ``}${optional ? `?` : ``}`
    return derived
        ? `+${simpleName}() : ${typeText}`
        : `+${typeText} ${simpleName}`
}


const generateForPrimitiveType = ({simpleName}: PrimitiveType) =>
`%% primitive type: "${simpleName}"

`
// Note: No construct for PrimitiveType exists in PlantUML.


const generateForMetamodelElement = (metamodelElement: MetamodelElement) => {
    if (metamodelElement instanceof Concept) {
        return generateForConcept(metamodelElement)
    }
    if (metamodelElement instanceof ConceptInterface) {
        return generateForConceptInterface(metamodelElement)
    }
    if (metamodelElement instanceof Enumeration) {
        return generateForEnumeration(metamodelElement)
    }
    if (metamodelElement instanceof PrimitiveType) {
        return generateForPrimitiveType(metamodelElement)
    }
    return ``   // unhandled metamodel element: ${metamodelElement.simpleName}
}


const generateForRelationsOf = (metamodelElement: MetamodelElement) => {
    const relations = relationsOf(metamodelElement)
    return relations.length === 0
        ? ``
        : relations
            .map((relation) => generateForRelation(metamodelElement, relation))
}


const generateForRelation = ({simpleName: leftName}: MetamodelElement, relation: Link) => {
    const {simpleName: relationName, optional, multiple, type} = relation
    const rightName = isRef(type) ? type.simpleName : (type === unresolved ? `<unresolved>` : `<null>`)
    const isContainment = relation instanceof Containment
    const leftMultiplicity = isContainment ? `1` : `*`
    const rightMultiplicity = (() => {
        if (multiple) {
            return "*"
        }
        return optional ? "0..1" : "1"
    })()
    return `${leftName} "${leftMultiplicity}" ${isContainment ? `o` : ``}-- "${rightMultiplicity}" ${rightName}: ${relationName}`
}

