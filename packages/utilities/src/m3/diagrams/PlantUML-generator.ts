import {asString, indentWith} from "littoral-templates"
import {
    Concept,
    Containment,
    entitiesSortedByName,
    Enumeration,
    Feature,
    Interface,
    isRef,
    Language,
    LanguageEntity,
    Link,
    nameOf,
    nonRelationalFeatures,
    PrimitiveType,
    relationsOf,
    type,
    unresolved
} from "@lionweb/core"


const indented = indentWith(`  `)(1)


/**
 * Generates a string with a PlantUML class diagram
 * representing the given {@link Language LionCore instance}.
 */
export const generatePlantUmlForLanguage = ({name, entities}: Language) =>
    asString([
`@startuml
hide empty members

' qualified name: "${name}"


`,
    entitiesSortedByName(entities).map(generateForElement),
`

' relations:

`,
    entitiesSortedByName(entities).map(generateForRelationsOf),
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


const generateForConcept = ({name, features, abstract: abstract_, extends: extends_, implements: implements_, partition}: Concept) => {
    const nonRelationalFeatures_ = nonRelationalFeatures(features)
    const fragments: string[] = []
    if (abstract_) {
        fragments.push(`abstract`)
    }
    fragments.push(`class`, name)
    if (partition) {
        fragments.push(`<<partition>>`)
    }
    if (isRef(extends_)) {
        fragments.push(`extends`, extends_.name)
    }
    if (implements_.length > 0) {
        fragments.push(`implements`, implements_.map(nameOf).sort().join(", "))
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


const generateForInterface = ({name, extends: extends_, features}: Interface) => {
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
    return `${name}: ${multiple ? `List<` : ``}${type_ === unresolved ? `???` : type_.name}${multiple ? `>` : ``}${(optional && !multiple) ? ` <<optional>>` : ``}`
}


const generateForPrimitiveType = ({name}: PrimitiveType) =>
`' primitive type: "${name}"

`
// Note: No construct for PrimitiveType exists in PlantUML.


const generateForElement = (element: LanguageEntity) => {
    if (element instanceof Enumeration) {
        return generateForEnumeration(element)
    }
    if (element instanceof Concept) {
        return generateForConcept(element)
    }
    if (element instanceof Interface) {
        return generateForInterface(element)
    }
    if (element instanceof PrimitiveType) {
        return generateForPrimitiveType(element)
    }
    return `' unhandled metamodel element: ${element.name}
`
}


const generateForRelationsOf = (element: LanguageEntity) => {
    const relations = relationsOf(element)
    return relations.length === 0
        ? ``
        : relations
            .map((relation) => generateForRelation(element, relation))
}


const generateForRelation = ({name: leftName}: LanguageEntity, relation: Link) => {
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

