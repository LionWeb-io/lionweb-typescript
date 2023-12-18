import {
    Id,
    SerializationChunk,
    SerializedContainment,
    SerializedNode,
    SerializedProperty,
    SerializedReference,
    SerializedReferenceTarget
} from "@lionweb/core"
import {asString, indentWith, NestedString} from "littoral-templates"


const indent = indentWith("    ")(1)


const propertyAsText = ({property, value}: SerializedProperty) =>
    `[${property.key}] = ${value}`

const referenceTargetAsText = ({reference, resolveInfo}: SerializedReferenceTarget) =>
    `${reference}${resolveInfo === undefined ? `` : ` (${resolveInfo})`}`

const referenceAsText = ({reference, targets}: SerializedReference) =>
    `[${reference.key}] -> ${targets.length === 0 ? `<none>` : targets.map(referenceTargetAsText).join(",")}`


export const genericAsTreeText = ({nodes}: SerializationChunk) => {
    const nodesById: { [id: Id]: SerializedNode } = {}
    nodes.forEach((node) => {
        nodesById[node.id] = node
    })

    const containmentAsText = ({containment, children}: SerializedContainment) =>
        [
            `[${containment.key}]:${children.length === 0 ? ` <none>` : ``}`,
            indent(children.map(
                (childId) =>
                    childId in nodesById
                        ? asText(nodesById[childId])
                        : `<child with id=${childId} not present in this chunk>`
            ))
        ]


    const asText = ({id, classifier, properties, containments, references}: SerializedNode): NestedString =>
        [
            `[${classifier.key}] (id: ${id}) {`,
            indent([
                properties.map(propertyAsText),
                references.map(referenceAsText),
                containments.map(containmentAsText)
            ]),
            `}`
        ]

    return asString(
        nodes
            .filter((node) => node.parent === null) // root nodes
            .map(asText)
    )
}

