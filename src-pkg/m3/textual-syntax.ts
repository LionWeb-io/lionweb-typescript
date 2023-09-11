import {
    Concept,
    ConceptInterface,
    Containment,
    Enumeration,
    EnumerationLiteral,
    INamed,
    Language,
    M3Node,
    PrimitiveType,
    Property,
    Reference
} from "./types.js"
import {nameOf} from "./functions.js"
import {sortByStringKey} from "../utils/sorting.js"
import {SingleRef, unresolved} from "../references.js"


// TODO  use littoral-templates?
const indent = (str: string) =>
    str.split("\n").map((line) => `    ${line}`).join("\n")


const nameSorted = <T extends INamed>(ts: T[]): T[] =>
    sortByStringKey(ts, nameOf)

const descent = <T extends M3Node>(ts: T[], separator: string): string =>
    nameSorted(ts).map((t) => indent(indent(asText(t)))).join(separator)

const refAsText = <T extends INamed>(ref: SingleRef<T>): string =>
    ref === unresolved ? `???` : ref.name


const asText = (node: M3Node): string => {

    if (node instanceof Concept) {
        return `${node.partition ? `<<partition>> ` : ``}${node.abstract ? `abstract ` : ``}concept ${node.name}${node.extends === undefined ? `` : ` extends ${refAsText(node.extends)}`}${node.implements.length === 0 ? `` : ` implements ${sortByStringKey(node.implements, nameOf).map(nameOf).join(", ")}`}${node.features.length === 0 ? `` : `
    features (↓name):
${descent(node.features, "\n")}`}`
    }

    if (node instanceof ConceptInterface) {
        return `concept-interface ${node.name}${node.extends.length === 0 ? `` : ` extends ${sortByStringKey(node.extends, nameOf).map(nameOf).join(", ")}`}${node.features.length === 0 ? `` : `
    features (↓name):
${descent(node.features, "\n")}`}`
    }

    if (node instanceof Containment) {
        return `${node.name}: ${refAsText(node.type)}${node.multiple ? `[${node.optional ? `0` : `1`}..*]` : ``}${node.optional && !node.multiple ? `?` : ``}`
    }

    if (node instanceof Enumeration) {
        return `enumeration ${node.name}${node.literals.length === 0 ? `` : `
    literals:
${descent(node.literals, "\n")}`}`
    }

    if (node instanceof EnumerationLiteral) {
        return `${node.name}`
    }

    if (node instanceof Language) {
        return `language ${node.name}
    version: ${node.version}${node.dependsOn.length > 0
        ? `    dependsOn:
${node.dependsOn.map((language) => `        ${language.key} (${language.version})`).join("\n")}
`
        : ``}
    entities (↓name):

${descent(node.entities, "\n\n")}

`
    }

    if (node instanceof PrimitiveType) {
        return `primitive type ${node.name}`
    }

    if (node instanceof Property) {
        return `${node.name}: ${refAsText(node.type)}${node.optional ? `?` : ``}`
    }

    if (node instanceof Reference) {
        return `${node.name} -> ${refAsText(node.type)}${node.multiple ? `[${node.optional ? `0` : `1`}..*]` : ``}${node.optional && !node.multiple ? `?` : ``}`
    }

    return `node (key=${node.key}, ID=${node.id}) of class ${node.constructor.name} not handled`

}


export {
    asText
}

