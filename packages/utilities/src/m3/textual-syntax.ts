import {
    Annotation,
    Concept,
    Containment,
    Enumeration,
    EnumerationLiteral,
    INamed,
    Interface,
    Language,
    Link,
    M3Node,
    nameOf,
    nameSorted,
    PrimitiveType,
    Property,
    SingleRef,
    unresolved
} from "@lionweb/core"


// TODO  use littoral-templates?
const indent = (str: string) =>
    str.split("\n").map((line) => `    ${line}`).join("\n")


const descent = <T extends M3Node>(ts: T[], separator: string): string =>
    nameSorted(ts).map((t) => indent(indent(asText(t)))).join(separator)

const refAsText = <T extends INamed>(ref: SingleRef<T>): string =>
    ref === unresolved ? `???` : ref.name


const asText = (node: M3Node): string => {

    if (node instanceof Annotation) {
        return `annotation ${node.name}${node.extends === undefined ? `` : ` extends ${refAsText(node.extends)}`}${node.implements.length === 0 ? `` : ` implements ${nameSorted(node.implements).map(nameOf).join(", ")}`}${node.features.length === 0 ? `` : `
    features (↓name):
${descent(node.features, "\n")}`}`
    }

    if (node instanceof Concept) {
        return `${node.partition ? `<<partition>> ` : ``}${node.abstract ? `abstract ` : ``}concept ${node.name}${node.extends === undefined ? `` : ` extends ${refAsText(node.extends)}`}${node.implements.length === 0 ? `` : ` implements ${nameSorted(node.implements).map(nameOf).join(", ")}`}${node.features.length === 0 ? `` : `
    features (↓name):
${descent(node.features, "\n")}`}`
    }

    if (node instanceof Interface) {
        return `interface ${node.name}${node.extends.length === 0 ? `` : ` extends ${nameSorted(node.extends).map(nameOf).join(", ")}`}${node.features.length === 0 ? `` : `
    features (↓name):
${descent(node.features, "\n")}`}`
    }

    if (node instanceof Link) {
        return `${node.name}${node instanceof Containment ? `:` : ` ->`} ${refAsText(node.type)}${node.multiple ? `[${node.optional ? `0` : `1`}..*]` : ``}${node.optional && !node.multiple ? `?` : ``}`
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
        ? `\n    dependsOn:
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

    return `node (key=${node.key}, ID=${node.id}) of class ${node.constructor.name} not handled`

}


export const languageAsText = asText

export const languagesAsText = (languages: Language[]): string =>
    nameSorted(languages).map(asText).join("\n\n")

