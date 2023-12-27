import {
    allFeaturesOf,
    Classifier,
    Id,
    Language,
    MetaPointer,
    NaiveSymbolTable,
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


    const symbolTable = new NaiveSymbolTable(languages)

    const lookUpFeature = (featureKey: string, classifier: Classifier) =>
        allFeaturesOf(classifier).find((feature) => feature.key === featureKey)

    const nameOrKey = ({key}: MetaPointer, classifier?: Classifier): string =>
        (classifier && lookUpFeature(key, classifier)?.name) ?? `[${key}]`


    const propertyAsText = ({property, value}: SerializedProperty, classifier?: Classifier) =>
        `${nameOrKey(property, classifier)} = ${value}`

    const referenceTargetAsText = ({reference: referenceId, resolveInfo}: SerializedReferenceTarget) =>
        `${referenceId}${resolveInfo === undefined ? `` : ` (${resolveInfo})`}`

    const referenceAsText = ({reference, targets}: SerializedReference, classifier?: Classifier) =>
        `${nameOrKey(reference, classifier)} -> ${targets.length === 0 ? `<none>` : targets.map(referenceTargetAsText).join(",")}`

    const containmentAsText = ({containment, children}: SerializedContainment, classifier?: Classifier) =>
        [
            `${nameOrKey(containment, classifier)}:${children.length === 0 ? ` <none>` : ``}`,
            indent(children.map(
                (childId) =>
                    childId in nodesById
                        ? asText(nodesById[childId])
                        : `<child with id=${childId} not present in this chunk>`
            ))
        ]


    const asText = ({id, classifier: classifierMetaPointer, properties, containments, references}: SerializedNode): NestedString => {
        const classifier = symbolTable.entityMatching(classifierMetaPointer) as (Classifier | undefined)    // typecast is OK: only (non-abstract) classifiers can have instances
        return [
            `${classifier?.name ?? `[${classifierMetaPointer.key}]`} (id: ${id}) {`,
            indent([
                properties.map((property) => propertyAsText(property, classifier)),
                references.map((reference) => referenceAsText(reference, classifier)),
                containments.map((containment) => containmentAsText(containment, classifier))
            ]),
            `}`
        ]
    }

    return asString(
        nodes
            .filter((node) => node.parent === null) // root nodes
            .map(asText)
    )
}

