import {
// eslint-disable-next-line @typescript-eslint/no-unused-vars
    Annotation,
    byIdMap,
    Id,
    SerializationChunk
} from "@lionweb/core"

/**
 * Removes all annotations from the given {@link SerializationChunk}, i.e.:
 *  * all annotations on nodes in the form of the {@code annotations} property,
 *  * all nodes that can be identified as instances of an {@link Annotation} by being referred to from {@code annotations}.
 * It also removes all descendants of all annotations.
 * @param serializationChunk - The {@link SerializationChunk}
 */
export const withoutAnnotations = (serializationChunk: SerializationChunk) => {
    const {serializationFormatVersion, languages, nodes} = serializationChunk
    const id2node = byIdMap(nodes)
    const childIds = (id: Id) =>
        id2node[id].containments.flatMap((containment) => containment.children)
    const descendantIds = (id: Id): Id[] =>
        [id, ...childIds(id).flatMap(descendantIds)]
    const annotationIds = nodes.flatMap((node) => node.annotations) // (are unique, because of parent-child relation)
    const idsOfNodesToDelete = [
        ...annotationIds,
        ...[...annotationIds].flatMap(descendantIds)
    ]
    return {
        serializationFormatVersion,
        languages,
        nodes: nodes
            .filter((node) => !idsOfNodesToDelete.includes(node.id)) // removes instances of annotations
            .map((node) =>  {
                node.annotations = []   // removes annotations attached to nodes that are instances of concepts
                return node
            })
    }
}

