import {
    Id,
    Language,
    MemoisingSymbolTable,
    MetaPointer,
    SerializationChunk,
    SerializedContainment,
    SerializedNode,
    SerializedProperty,
    SerializedReference,
    SerializedReferenceTarget
} from "@lionweb/core"
import {asString, indentWith, NestedString} from "littoral-templates"


const indent = indentWith("    ")(1)


export const genericAsTreeText = ({nodes}: SerializationChunk, languages: Language[] = []) => {

    const nodesById: { [id: Id]: SerializedNode } = {}
    nodes.forEach((node) => {
        nodesById[node.id] = node
    })


    const symbolTable = new MemoisingSymbolTable(languages)

    const lookUpFeature = (classifier: MetaPointer, feature: MetaPointer) =>
        symbolTable.featureMatching(classifier, feature)

    const nameOrKey = (classifier: MetaPointer, feature: MetaPointer): string =>
        (classifier && lookUpFeature(classifier, feature)?.name) ?? `[${feature.key}]`


    const propertyAsText = (classifier: MetaPointer, {property, value}: SerializedProperty) =>
        `${nameOrKey(classifier, property)} = ${value}`

    const referenceTargetAsText = ({reference: referenceId, resolveInfo}: SerializedReferenceTarget) =>
        `${referenceId}${resolveInfo === undefined ? `` : ` (${resolveInfo})`}`

    const referenceAsText = (classifier: MetaPointer, {reference, targets}: SerializedReference) =>
        `${nameOrKey(classifier, reference)} -> ${targets.length === 0 ? `<none>` : targets.map(referenceTargetAsText).join(",")}`

    const containmentAsText = (classifier: MetaPointer, {containment, children}: SerializedContainment) =>
        [
            `${nameOrKey(classifier, containment)}:${children.length === 0 ? ` <none>` : ``}`,
            indent(children.map(
                (childId) =>
                    childId in nodesById
                        ? asText(nodesById[childId])
                        : `<child with id=${childId} not present in this chunk>`
            ))
        ]


    const curry1 = <T1, T2, R>(func: (t1: T1, t2: T2) => R, t1: T1): ((t2: T2) => R) =>
        (t2: T2) => func(t1, t2)

    const asText = ({id, classifier: classifierMetaPointer, properties, containments, references}: SerializedNode): NestedString =>
        [
            `${symbolTable.entityMatching(classifierMetaPointer)?.name ?? `[${classifierMetaPointer.key}]`} (id: ${id}) {`,
            indent([
                properties.map(curry1(propertyAsText, classifierMetaPointer)),
                references.map(curry1(referenceAsText, classifierMetaPointer)),
                containments.map(curry1(containmentAsText, classifierMetaPointer))
            ]),
            `}`
        ]

    return asString(
        nodes
            .filter((node) => node.parent === null) // root nodes
            .map(asText)
    )
}

