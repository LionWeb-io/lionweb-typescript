import { byIdMap, Enumeration, Language, MemoisingSymbolTable, Property } from "@lionweb/core"
import {
    LionWebId,
    LionWebJsonChunk,
    LionWebJsonContainment,
    LionWebJsonMetaPointer,
    LionWebJsonNode,
    LionWebJsonProperty,
    LionWebJsonReference,
    LionWebJsonReferenceTarget
} from "@lionweb/json"
import { asString, indentWith, Template } from "littoral-templates"

const indent = indentWith("    ")(1)

const prependWith = (template: Template, prefix: string): Template => prefix + asString(template)

export const genericAsTreeText = ({ nodes }: LionWebJsonChunk, languages: Language[] = []) => {
    const nodesById: { [id: LionWebId]: LionWebJsonNode } = byIdMap(nodes)
    const symbolTable = new MemoisingSymbolTable(languages)

    const nameOrKey = (classifier: LionWebJsonMetaPointer, feature: LionWebJsonMetaPointer): string =>
        symbolTable.featureMatching(classifier, feature)?.name ?? `[${feature.key}]`

    const propertyAsText = (classifier: LionWebJsonMetaPointer, { property: propertyMetaPointer, value }: LionWebJsonProperty) => {
        const property = symbolTable.featureMatching(classifier, propertyMetaPointer)
        const identification = nameOrKey(classifier, propertyMetaPointer)
        const displayValue =
            property instanceof Property
                ? property.type instanceof Enumeration
                    ? (property.type.literals.find(literal => literal.key === value)?.name ?? value)
                    : (() => {
                          switch (property?.type?.name) {
                              case "String":
                                  return `'${value}'`
                              default:
                                  return value
                          }
                      })()
                : value
        return `${identification} = ${displayValue}`
    }

    const referenceTargetAsText = ({ reference: referenceId, resolveInfo }: LionWebJsonReferenceTarget) =>
        `${referenceId}${resolveInfo === undefined ? `` : ` (${resolveInfo})`}`

    const referenceAsText = (classifier: LionWebJsonMetaPointer, { reference, targets }: LionWebJsonReference) =>
        `${nameOrKey(classifier, reference)} -> ${targets.length === 0 ? `<none>` : targets.map(referenceTargetAsText).join(",")}`

    const containmentAsText = (classifier: LionWebJsonMetaPointer, { containment, children }: LionWebJsonContainment) => [
        `${nameOrKey(classifier, containment)}:${children.length === 0 ? ` <none>` : ``}`,
        indent(
            children.map(childId =>
                childId in nodesById ? asText(nodesById[childId]) : `<child with id=${childId} not present in this chunk>`
            )
        )
    ]

    const annotationAsText = (annotationId: LionWebId) =>
        annotationId in nodesById
            ? prependWith(asText(nodesById[annotationId]), "@ ")
            : `<annotation with id=${annotationId} not present in this chunk>`

    const curry1 =
        <T1, T2, R>(func: (t1: T1, t2: T2) => R, t1: T1): ((t2: T2) => R) =>
        (t2: T2) =>
            func(t1, t2)

    const asText = ({
        id,
        classifier: classifierMetaPointer,
        properties,
        containments,
        references,
        annotations
    }: LionWebJsonNode): Template => [
        `${symbolTable.entityMatching(classifierMetaPointer)?.name ?? `[${classifierMetaPointer.key}]`} (id: ${id}) {`,
        indent([
            properties.map(curry1(propertyAsText, classifierMetaPointer)),
            references.map(curry1(referenceAsText, classifierMetaPointer)),
            containments.map(curry1(containmentAsText, classifierMetaPointer)),
            annotations.map(annotationAsText)
        ]),
        `}`
    ]

    return asString(
        nodes
            .filter(node => node.parent === null) // root nodes
            .map(asText)
    )
}
