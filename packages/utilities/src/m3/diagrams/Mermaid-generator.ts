import {asString, indentWith, NestedString} from "littoral-templates"
import {
    Annotation,
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
    nonRelationalFeatures,
    PrimitiveType,
    relationsOf,
    type,
    unresolved
} from "@lionweb/core"


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


/**
 * Generates a string with a Mermaid class diagram
 * representing the given {@link Language LionCore instance}.
 */
export const generateMermaidForLanguage = ({entities}: Language) =>
    asString([
        "```mermaid",
        `classDiagram

`,
        indented(entitiesSortedByName(entities).map(generateForEntity)),
        ``,
        indented(entitiesSortedByName(entities).map(generateForRelationsOf)),
        ``,
        "```"
    ])


const generateForEnumeration = ({name, literals}: Enumeration) =>
    withNewLine(block(
        `class ${name}`,
        [
            `<<enumeration>>`,
            literals.map(({name}) => name)
        ]
    ))


const generateForAnnotation = ({name, features, extends: extends_/*, implements: implements_*/}: Annotation) =>
    [
        block(
            `annotation ${name}`,
            nonRelationalFeatures(features).map(generateForNonRelationalFeature)
        ),
        isRef(extends_) ? `${extends_.name} <|-- ${name}` : [],
        ``
    ]

const generateForConcept = ({name, features, abstract: abstract_, extends: extends_/*, implements: implements_*/, partition}: Concept) =>
    [
        block(
            `class ${partition ? `<<partition>> ` : ``}${name}`,
            nonRelationalFeatures(features).map(generateForNonRelationalFeature)
        ),
        abstract_ ? `<<Abstract>> ${name}` : [],
        isRef(extends_) ? `${extends_.name} <|-- ${name}` : [],
        ``
    ]


const generateForInterface = ({name, features, extends: extends_}: Interface) =>
    [
        block(
            `class ${name}`,
            nonRelationalFeatures(features).map(generateForNonRelationalFeature)
        ),
        `<<Interface>> ${name}`,
        extends_.map(({name: extendsName}) => `${extendsName} <|-- ${name}`),
        ``
    ]


const generateForNonRelationalFeature = (feature: Feature) => {
    const {name, optional} = feature
    const multiple = feature instanceof Link && feature.multiple
    const type_ = type(feature)
    const typeText = `${multiple ? `List~` : ``}${type_ === unresolved ? `???` : type_.name}${multiple ? `~` : ``}${optional ? `?` : ``}`
    return `+${typeText} ${name}`
}


const generateForPrimitiveType = ({name}: PrimitiveType) =>
`%% primitive type: "${name}"

`
// Note: No construct for PrimitiveType exists in PlantUML.


const generateForEntity = (entity: LanguageEntity) => {
    if (entity instanceof Annotation) {
        return generateForAnnotation(entity)
    }
    if (entity instanceof Concept) {
        return generateForConcept(entity)
    }
    if (entity instanceof Enumeration) {
        return generateForEnumeration(entity)
    }
    if (entity instanceof Interface) {
        return generateForInterface(entity)
    }
    if (entity instanceof PrimitiveType) {
        return generateForPrimitiveType(entity)
    }
    return `// unhandled language entity: <${entity.constructor.name}>${entity.name}`
}


const generateForRelationsOf = (entity: LanguageEntity) => {
    const relations = relationsOf(entity)
    return relations.length === 0
        ? ``
        : relations
            .map((relation) => generateForRelation(entity, relation))
}


const generateForRelation = ({name: leftName}: LanguageEntity, relation: Link) => {
    const {name: relationName, optional, multiple, type} = relation
    const rightName = isRef(type) ? type.name : (type === unresolved ? `<unresolved>` : `<null>`)
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

