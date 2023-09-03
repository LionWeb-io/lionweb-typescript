import {asString, indentWith, NestedString} from "../../deps.ts"
import {
    Concept,
    ConceptInterface,
    Containment,
    entitiesSortedByName,
    Enumeration,
    Feature,
    isRef,
    Language,
    LanguageEntity,
    Link,
    nonRelationalFeatures,
    PrimitiveType,
    relationsOf,
    type,
    unresolved
} from "../../../src/index.ts"


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
 * representing the given {@link Language LIonCore/M3 instance}.
 */
export const generateMermaidForLanguage = ({entities}: Language) =>
    asString([
        "```mermaid",
        `classDiagram

`,
        indented(entitiesSortedByName(entities).map(generateForElement)),
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


const generateForConceptInterface = ({name, features, extends: extends_}: ConceptInterface) =>
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


const generateForElement = (element: LanguageEntity) => {
    if (element instanceof Concept) {
        return generateForConcept(element)
    }
    if (element instanceof ConceptInterface) {
        return generateForConceptInterface(element)
    }
    if (element instanceof Enumeration) {
        return generateForEnumeration(element)
    }
    if (element instanceof PrimitiveType) {
        return generateForPrimitiveType(element)
    }
    return `// unhandled metamodel element: ${element.name}`
}


const generateForRelationsOf = (element: LanguageEntity) => {
    const relations = relationsOf(element)
    return relations.length === 0
        ? ``
        : relations
            .map((relation) => generateForRelation(element, relation))
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

