import {asString, indentWith} from "../../deps.ts"
import {
    Concept,
    ConceptInterface,
    Containment,
    Enumeration,
    Feature,
    Language,
    LanguageElement,
    Link,
    PrimitiveType
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
 * representing the given {@link Language LIonCore/M3 instance}.
 */
export const generatePlantUmlForMetamodel = ({name, elements}: Language) =>
    asString([
`@startuml
hide empty members

' qualified name: "${name}"


`,
    elementsSortedByName(elements).map(generateForElement),
`

' relations:

`,
    elementsSortedByName(elements).map(generateForRelationsOf),
`
@enduml
`
])

const generateForEnumeration = ({name, literals}: Enumeration) =>
    [
`enum ${name} {`,
        indented(literals.map(({name}) => name)),
`}

`
    ]


const generateForConcept = ({name, features, abstract: abstract_, extends: extends_, implements: implements_}: Concept) => {
    const nonRelationalFeatures_ = nonRelationalFeatures(features)
    const fragments: string[] = []
    if (abstract_) {
        fragments.push(`abstract`)
    }
    fragments.push(`class`, name)
    if (isRef(extends_)) {
        fragments.push(`extends`, extends_.name)
    }
    if (implements_.length > 0) {
        fragments.push(`implements`, implements_.map((conceptInterface) => conceptInterface.name).sort().join(", "))
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


const generateForConceptInterface = ({name, extends: extends_, features}: ConceptInterface) => {
    const nonRelationalFeatures_ = nonRelationalFeatures(features)
    const fragments: string[] = [`interface`, name]
    if (extends_.length > 0) {
        fragments.push(`extends`, extends_.map((superInterface) => superInterface.name).join(", "))
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
    const {name, optional} = feature
    const multiple = feature instanceof Link && feature.multiple
    const type_ = type(feature)
    return `${name}: ${multiple ? `List<` : ``}${type_ === unresolved ? `???` : type_.name}${multiple ? `>` : ``}${(optional && !multiple) ? `?` : ``}`
}


const generateForPrimitiveType = ({name}: PrimitiveType) =>
`' primitive type: "${name}"

`
// Note: No construct for PrimitiveType exists in PlantUML.


const generateForElement = (element: LanguageElement) => {
    if (element instanceof Enumeration) {
        return generateForEnumeration(element)
    }
    if (element instanceof Concept) {
        return generateForConcept(element)
    }
    if (element instanceof ConceptInterface) {
        return generateForConceptInterface(element)
    }
    if (element instanceof PrimitiveType) {
        return generateForPrimitiveType(element)
    }
    return `' unhandled metamodel element: ${element.name}
`
}


const generateForRelationsOf = (element: LanguageElement) => {
    const relations = relationsOf(element)
    return relations.length === 0
        ? ``
        : relations
            .map((relation) => generateForRelation(element, relation))
}


const generateForRelation = ({name: leftName}: LanguageElement, relation: Link) => {
    const {name: relationName, type, optional, multiple} = relation
    const rightName = isRef(type) ? type.name : (type === unresolved ? `<unresolved>` : `<null>`)
    const isContainment = relation instanceof Containment
    const leftMultiplicity = isContainment ? `1` : `*`
    const rightMultiplicity = multiple ? "*" : (optional ? "0..1" : "1")
    return `${leftName} "${leftMultiplicity}" ${isContainment ? `o` : ``}-- "${rightMultiplicity}" ${rightName}: ${relationName}`
}


/*
 Notes:
    1. No construct for PrimitiveType in PlantUML.
 */

