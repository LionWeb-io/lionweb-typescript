import {
    Concept,
    ConceptInterface,
    Containment,
    Enumeration,
    Feature,
    Link,
    Metamodel,
    MetamodelElement,
    Multiplicity,
    PrimitiveType,
    unresolved
} from "./types.ts"
import {
    isPlural,
    nonRelationalFeatures,
    relationsOf,
    sortByStringKey,
    type
} from "./functions.ts"


const indented = (lines: string[]) =>
    lines.map((line) => `  ${line}`).join("\n")


const sortByName = (metamodelElements: MetamodelElement[]) =>
    sortByStringKey(metamodelElements, (element) => element.name)


export const generateForMetamodel = ({qualifiedName, elements}: Metamodel) =>
`@startuml

' qualified name: "${qualifiedName}"


${sortByName(elements).map(generateForMetamodelElement).join("\n")}


' relations:

${sortByName(elements).map((element) => generateForRelationsOf(element)).join("")}
@enduml
`


const generateForEnumeration = ({name, literals}: Enumeration) =>
`enum ${name} {
${indented(literals.map(({name}) => name))}
}
`


const generateForConcept = ({name, features, abstract: abstract_, extends: extends_, implements: implements_}: Concept) => {
    const nonRelationalFeatures_ = nonRelationalFeatures(features)
    const fragments: string[] = []
    if (abstract_) {
        fragments.push(`abstract`)
    }
    fragments.push(`class`, name)
    if (extends_ !== undefined && extends_ !== unresolved) {
        fragments.push(`extends`, extends_.name)
    }
    if (implements_.length > 0) {
        fragments.push(`implements`, implements_.map((conceptInterface) => conceptInterface.name).sort().join(", "))
    }
    return `${fragments.join(" ")}${nonRelationalFeatures_.length === 0 ? `` : ` {
${indented(nonRelationalFeatures_.map(generateForNonRelationalFeature))}
}`}
`
}


const generateForConceptInterface = ({name, extends: extends_, features}: ConceptInterface) => {
    const nonRelationalFeatures_ = nonRelationalFeatures(features)
    const fragments: string[] = [`interface`, name]
    if (extends_.length > 0) {
        fragments.push(`extends`, extends_.map((superInterface) => superInterface.name).join(", "))
    }
    return `${fragments.join(" ")}${nonRelationalFeatures_.length === 0 ? `` : ` {
${indented(nonRelationalFeatures_.map(generateForNonRelationalFeature))}
}`}
`
}


const generateForNonRelationalFeature = (feature: Feature) => {
    const {name, multiplicity, derived} = feature
    const isListy = isPlural(multiplicity)
    const type_ = type(feature)
    return `${name}${derived ? `()` : ``}: ${isListy ? `List<` : ``}${type_ === unresolved ? `???` : type_.name}${isPlural(multiplicity) ? `>` : ``}${multiplicity === Multiplicity.Optional ? `?` : ``}`
}


const generateForPrimitiveType = ({name}: PrimitiveType) =>
`' primitive type: "${name}"
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
    return `' unhandled metamodel element: ${metamodelElement.name}
`
}


const generateForRelationsOf = (metamodelElement: MetamodelElement) => {
    const relations = relationsOf(metamodelElement)
    return relations.length === 0
        ? ``
        : relations
            .map((relation) => generateForRelation(metamodelElement, relation))
            .join("\n") + "\n\n"
}


const generateForRelation = ({name: leftName}: MetamodelElement, relation: Link) => {
    const {name, multiplicity, type} = relation
    const rightName = type === unresolved ? `???` : type.name
    const isContainment = relation instanceof Containment
    const leftMultiplicity = isContainment ? `1` : `*`
    const rightMultiplicity = (() => {
        switch (multiplicity) {
            case Multiplicity.OneOrMore: return "*"
            case Multiplicity.Optional: return "0..1"
            case Multiplicity.Single: return "1"
            case Multiplicity.ZeroOrMore: return "*"
        }
    })()
    return `${leftName} "${leftMultiplicity}" ${isContainment ? `o` : ``}-- "${rightMultiplicity}" ${rightName}: ${name}`
}


/*
 Notes:
    1. No construct for PrimitiveType in PlantUML.
 */

