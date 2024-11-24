import {
    Annotation,
    Classifier,
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
import {asString, indentWith, Template} from "littoral-templates"


const indented = indentWith("    ")(1)

const refAsText = <T extends INamed>(ref: SingleRef<T>): string =>
    ref === unresolved ? `???` : ref.name

const recurse = <T extends M3Node>(ts: T[], header: string, func: (t: T) => Template = asText): Template =>
    ts.length === 0
        ? []
        : indented([
            header,
            indented(ts.map(func))
        ])

const featuresOf = (classifier: Classifier): Template =>
    recurse(nameSorted(classifier.features), `features (↓name):`)

const asText = (node: M3Node): Template => {

    if (node instanceof Annotation) {
        return [
            `annotation ${node.name}${node.extends === undefined ? `` : ` extends ${refAsText(node.extends)}`}${node.implements.length === 0 ? `` : ` implements ${nameSorted(node.implements).map(nameOf).join(", ")}`}`,
            featuresOf(node)
        ]
    }

    if (node instanceof Concept) {
        return [
            `${node.partition ? `<<partition>> ` : ``}${node.abstract ? `abstract ` : ``}concept ${node.name}${node.extends === undefined ? `` : ` extends ${refAsText(node.extends)}`}${node.implements.length === 0 ? `` : ` implements ${nameSorted(node.implements).map(nameOf).join(", ")}`}`,
            featuresOf(node)
        ]
    }

    if (node instanceof Interface) {
        return [
            `interface ${node.name}${node.extends.length === 0 ? `` : ` extends ${nameSorted(node.extends).map(nameOf).join(", ")}`}`,
            featuresOf(node)
        ]
    }

    if (node instanceof Link) {
        return `${node.name}${node instanceof Containment ? `:` : ` ->`} ${refAsText(node.type)}${node.multiple ? `[${node.optional ? `0` : `1`}..*]` : ``}${node.optional && !node.multiple ? `?` : ``}`
    }

    if (node instanceof Enumeration) {
        return [
            `enumeration ${node.name}`,
            recurse(node.literals, `literals:`)
        ]
    }

    if (node instanceof EnumerationLiteral) {
        return `${node.name}`
    }

    if (node instanceof Language) {
        return [
            `language ${node.name}`,
            indented([
                `version: ${node.version}`,
                node.dependsOn.length === 0
                    ? []
                    : [
                        `dependsOn:`,
                        indented(node.dependsOn.map((language) => `${language.name} (${language.version})`))
                    ],
                `entities (↓name):`,
                ``,
                indented(nameSorted(node.entities).map((entity) => [asText(entity), ``]))
            ]),
            ``
        ]
    }

    if (node instanceof PrimitiveType) {
        return `primitive type ${node.name}`
    }

    if (node instanceof Property) {
        return `${node.name}: ${refAsText(node.type)}${node.optional ? `?` : ``}`
    }

    return `node (key=${node.key}, ID=${node.id}) of class ${node.constructor.name} not handled`

}


export const languageAsText = (language: Language) =>
    asString(asText(language))

export const languagesAsText = (languages: Language[]): string =>
    asString(
        nameSorted(languages).map((language) => [asText(language), ``])
    )

