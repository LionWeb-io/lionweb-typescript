import {
    Annotation,
    Concept,
    Containment,
    Enumeration,
    Feature,
    Interface,
    isBuiltinNodeConcept,
    isRef,
    Language,
    LanguageEntity,
    Link,
    nameOf,
    nameSorted,
    nonRelationalFeatures,
    PrimitiveType,
    relationsOf,
    type,
    unresolved
} from "@lionweb/core"
import { asString, indentWith } from "littoral-templates"

import { DiagramRenderer } from "./type.js"


const indented = indentWith(`  `)(1)

/**
 * Generates a string with a PlantUML class diagram
 * representing the given {@link Language LionCore instance}.
 * The optional second `focusEntities` argument determines which entities to focus on.
 */
export const generatePlantUmlForLanguage: DiagramRenderer = ({ name, entities }: Language, focusEntities: LanguageEntity[] = nameSorted(entities)) =>
    asString([
        `@startuml`,
        `hide empty members`,
        ``,
        `' qualified name: "${name}"`,
        ``,
        ``,
        focusEntities.map(generateForEntity),
        ``,
        ``,
        `' relations:`,
        ``,
        focusEntities.map(generateForRelationsOf),
        ``,
        `@enduml`
    ])

const generateForEnumeration = ({ name, literals }: Enumeration) => [
    `enum ${name} {`,
    indented(literals.map(({ name }) => name)),
    `}`,
    ``
]

const generateForAnnotation = ({ name, features, extends: extends_, implements: implements_, annotates }: Annotation) => {
    const fragments: string[] = []
    fragments.push(`annotation`, name)
    if (isRef(extends_) && !isBuiltinNodeConcept(extends_)) {
        fragments.push(`extends`, extends_.name)
    }
    if (implements_.length > 0) {
        fragments.push(`implements`, implements_.filter(isRef).map(nameOf).sort().join(", "))
    }
    const nonRelationalFeatures_ = nonRelationalFeatures(features)
    return nonRelationalFeatures_.length === 0
        ? [`${fragments.join(" ")}`, isRef(annotates) ? `${name} ..# ${annotates.name} : <i>annotates</i>` : [], ``]
        : [`${fragments.join(" ")} {`, indented(nonRelationalFeatures_.map(generateForNonRelationalFeature)), `}`, ``]
}

const generateForConcept = ({ name, features, abstract: abstract_, extends: extends_, implements: implements_, partition }: Concept) => {
    const fragments: string[] = []
    if (abstract_) {
        fragments.push(`abstract`)
    }
    fragments.push(`class`, name)
    if (partition) {
        fragments.push(`<<partition>>`)
    }
    if (isRef(extends_) && !isBuiltinNodeConcept(extends_)) {
        fragments.push(`extends`, extends_.name)
    }
    if (implements_.length > 0) {
        fragments.push(`implements`, implements_.filter(isRef).map(nameOf).sort().join(", "))
    }
    const nonRelationalFeatures_ = nonRelationalFeatures(features)
    return nonRelationalFeatures_.length === 0
        ? [`${fragments.join(" ")}`, ``]
        : [`${fragments.join(" ")} {`, indented(nonRelationalFeatures_.map(generateForNonRelationalFeature)), `}`, ``]
}

const generateForInterface = ({ name, extends: extends_, features }: Interface) => {
    const fragments: string[] = [`interface`, name]
    if (extends_.length > 0) {
        fragments.push(`extends`, extends_.filter(isRef).map(superInterface => superInterface.name).join(", "))
    }
    const nonRelationalFeatures_ = nonRelationalFeatures(features)
    return nonRelationalFeatures_.length === 0
        ? `${fragments.join(" ")}`
        : [`${fragments.join(" ")} {`, indented(nonRelationalFeatures_.map(generateForNonRelationalFeature)), `}`, ``]
}

const generateForNonRelationalFeature = (feature: Feature) => {
    const { name, optional } = feature
    const multiple = feature instanceof Link && feature.multiple
    const type_ = type(feature)
    return `${name}: ${multiple ? `List<` : ``}${type_ === unresolved ? `???` : type_.name}${optional && !multiple ? `?` : ``}${multiple ? `>` : ``}`
}

const generateForPrimitiveType = ({ name }: PrimitiveType) => `class "${name}" <<primitive type>>`

const generateForEntity = (entity: LanguageEntity) => {
    if (entity instanceof Annotation) {
        return generateForAnnotation(entity)
    }
    if (entity instanceof Enumeration) {
        return generateForEnumeration(entity)
    }
    if (entity instanceof Concept) {
        return generateForConcept(entity)
    }
    if (entity instanceof Interface) {
        return generateForInterface(entity)
    }
    if (entity instanceof PrimitiveType) {
        return generateForPrimitiveType(entity)
    }
    return [
        `' unhandled language entity: <${entity.constructor.name}>${entity.name}`,
        ``
    ]
}

const generateForRelationsOf = (entity: LanguageEntity) => {
    const relations = relationsOf(entity)
    return relations.length === 0 ? `` : relations.map(relation => generateForRelation(entity, relation))
}

const generateForRelation = ({ name: leftName }: LanguageEntity, relation: Link) => {
    const { name: relationName, type, optional, multiple } = relation
    const rightName = isRef(type) ? type.name : type === unresolved ? `<unresolved>` : `<null>`
    const isContainment = relation instanceof Containment
    const leftMultiplicity = isContainment ? `1` : `*`
    const rightMultiplicity = multiple ? "*" : optional ? "0..1" : "1"
    return `${leftName} "${leftMultiplicity}" ${isContainment ? `o` : ``}--> "${rightMultiplicity}" ${rightName}: ${relationName}`
}

/*
 Notes:
    1. No construct for PrimitiveType in PlantUML.
 */
