import {asString, indentWith} from "npm:littoral-templates"

import {
    Concept,
    ConceptInterface,
    Containment,
    Enumeration,
    Feature,
    Link,
    Metamodel,
    MetamodelElement,
    PrimitiveType,
    Property
} from "../types.ts"
import {
    elementsSortedByName,
    nonRelationalFeatures,
    relationsOf,
    type
} from "../functions.ts"
import {isRef, unresolved} from "../../references.ts"


const indented = indentWith(`  `)(1)


/**
 * Generates a string with a PlantUML class diagram
 * representing the given {@link Metamodel LIonCore/M3 instance}.
 */
export const generatePlantUmlForMetamodel = ({qualifiedName, elements}: Metamodel) =>
    asString([
`@startuml
hide empty members

' qualified name: "${qualifiedName}"


`,
    elementsSortedByName(elements).map(generateForMetamodelElement),
`

' relations:

`,
    elementsSortedByName(elements).map(generateForRelationsOf),
`
legend
  <#LightGray,#LightGray>| <#Orange>Programmatic |
end legend
@enduml
`
])

const generateForEnumeration = ({simpleName, literals}: Enumeration) =>
    [
`enum ${simpleName} {`,
        indented(literals.map(({simpleName}) => simpleName)),
`}

`
    ]


const generateForConcept = ({simpleName, features, abstract: abstract_, extends: extends_, implements: implements_}: Concept) => {
    const nonRelationalFeatures_ = nonRelationalFeatures(features)
    const fragments: string[] = []
    if (abstract_) {
        fragments.push(`abstract`)
    }
    fragments.push(`class`, simpleName)
    if (isRef(extends_)) {
        fragments.push(`extends`, extends_.simpleName)
    }
    if (implements_.length > 0) {
        fragments.push(`implements`, implements_.map((conceptInterface) => conceptInterface.simpleName).sort().join(", "))
    }
    return nonRelationalFeatures_.length === 0
        ? [
            `${fragments.join(" ")}`,
            ``
        ]
        : [
            `${fragments.join(" ")} {`,
            indented(nonRelationalFeatures_.map(generateForNonRelationalFeature)),
            `}`,
            ``
        ]
}


const generateForConceptInterface = ({simpleName, extends: extends_, features}: ConceptInterface) => {
    const nonRelationalFeatures_ = nonRelationalFeatures(features)
    const fragments: string[] = [`interface`, simpleName]
    if (extends_.length > 0) {
        fragments.push(`extends`, extends_.map((superInterface) => superInterface.simpleName).join(", "))
    }
    return nonRelationalFeatures_.length === 0
        ? `${fragments.join(" ")}`
        : [
            `${fragments.join(" ")} {`,
            indented(nonRelationalFeatures_.map(generateForNonRelationalFeature)),
            `}`,
            ``
        ]
}


const generateForNonRelationalFeature = (feature: Feature) => {
    const {simpleName, optional, derived} = feature
    const multiple = feature instanceof Link && feature.multiple
    const type_ = type(feature)
    return `${(feature instanceof Property && feature.programmatic) ? "#Orange ": ""}${simpleName}${derived ? `()` : ``}: ${multiple ? `List<` : ``}${type_ === unresolved ? `???` : type_.simpleName}${multiple ? `>` : ``}${(optional && !multiple) ? `?` : ``}`
}


const generateForPrimitiveType = ({simpleName}: PrimitiveType) =>
`' primitive type: "${simpleName}"

`
// Note: No construct for PrimitiveType exists in PlantUML.


const generateForMetamodelElement = (metamodelElement: MetamodelElement) => {
    if (metamodelElement instanceof Enumeration) {
        return generateForEnumeration(metamodelElement)
    }
    if (metamodelElement instanceof Concept) {
        return generateForConcept(metamodelElement)
    }
    if (metamodelElement instanceof ConceptInterface) {
        return generateForConceptInterface(metamodelElement)
    }
    if (metamodelElement instanceof PrimitiveType) {
        return generateForPrimitiveType(metamodelElement)
    }
    return `' unhandled metamodel element: ${metamodelElement.simpleName}
`
}


const generateForRelationsOf = (metamodelElement: MetamodelElement) => {
    const relations = relationsOf(metamodelElement)
    return relations.length === 0
        ? ``
        : relations
            .map((relation) => generateForRelation(metamodelElement, relation))
}


const generateForRelation = ({simpleName: leftName}: MetamodelElement, relation: Link) => {
    const {simpleName: relationName, type, optional, multiple} = relation
    const rightName = isRef(type) ? type.simpleName : (type === unresolved ? `<unresolved>` : `<null>`)
    const isContainment = relation instanceof Containment
    const leftMultiplicity = isContainment ? `1` : `*`
    const rightMultiplicity = multiple ? "*" : (optional ? "0..1" : "1")
    return `${leftName} "${leftMultiplicity}" ${isContainment ? `o` : ``}-- "${rightMultiplicity}" ${rightName}: ${relationName}`
}


/*
 Notes:
    1. No construct for PrimitiveType in PlantUML.
 */

