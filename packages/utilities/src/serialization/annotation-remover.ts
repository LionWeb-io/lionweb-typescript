import {
// eslint-disable-next-line @typescript-eslint/no-unused-vars
    Annotation,
    SerializationChunk
} from "@lionweb/core"

/**
 * Removes all annotations from the given {@link SerializationChunk}, i.e.:
 *  * all annotations on nodes in the form of the {@code annotations} property,
 *  * all nodes that can be identified as instances of an {@link Annotation} by being referred to from {@code annotations}.
 * @param serializationChunk - The {@link SerializationChunk}
 */
export const withoutAnnotations = (serializationChunk: SerializationChunk) => {
    const {serializationFormatVersion, languages, nodes} = serializationChunk
    const annotationIds = new Set(nodes.flatMap((node) => node.annotations))
    return {
        serializationFormatVersion,
        languages,
        nodes: nodes
            .filter((node) => !annotationIds.has(node.id)) // removes instances of annotations
            .map((node) =>  {
                node.annotations = []   // removes annotations attached to nodes that are instances of concepts
                return node
            })
    }
}

