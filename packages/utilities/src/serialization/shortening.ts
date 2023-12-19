import {SerializationChunk} from "@lionweb/core"


/**
 * @return A shortened version of a {@link SerializedModel JSON serialization}, which should make it easier to inspect.
 *  Note that the shortened version doesn't contain all information, and could (in theory) be malformed.
 */
export const shortenedSerializationChunk = ({nodes}: SerializationChunk) =>
    nodes.map((node) => ({
        id: node.id,
        classifier: node.classifier.key,
        ...Object.fromEntries(
            [
                ...node.properties.map((serProp) => [serProp.property.key, serProp.value]),
                ...node.containments.map((serContainment) => [serContainment.containment.key, serContainment.children]),
                ...node.references.map((serReference) => [serReference.reference.key, serReference.targets.map(({reference}) => reference)])
            ]
        ),
        parent: node.parent ?? undefined
    }))

