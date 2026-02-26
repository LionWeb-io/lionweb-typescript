import {
// eslint-disable-next-line @typescript-eslint/no-unused-vars
    Annotation
} from "@lionweb/core"
import { LionWebId, LionWebJsonChunk, LionWebJsonNode } from "@lionweb/json"
import { byIdMap } from "@lionweb/ts-utils"

/**
 * Removes all annotations from the given {@link LionWebJsonChunk}, i.e.:
 *  * all annotations on nodes in the form of the `annotations` property,
 *  * all nodes that can be identified as instances of an {@link Annotation} by being referred to from `annotations`.
 * It also removes all descendants of all annotations (insofar present in the given chunk).
 * @param serializationChunk - The {@link LionWebJsonChunk}
 */
export const withoutAnnotations = (serializationChunk: LionWebJsonChunk) => {
    const {serializationFormatVersion, languages, nodes} = serializationChunk
    const id2node = byIdMap(nodes)
    const childIds = (id: LionWebId) =>
        (id in id2node)
            ? id2node[id].containments.flatMap((containment) => containment.children)
            : []
    const descendantIds = (id: LionWebId): LionWebId[] =>
        [id, ...childIds(id).flatMap(descendantIds)]
    const annotationIds = nodes.flatMap((node) => node.annotations) // (are unique, because of parent-child relation)
    const idsOfNodesToDelete = [
        ...annotationIds,
        ...[...annotationIds].flatMap(descendantIds)
    ]
    const withoutAnnotations = ({ id, classifier, properties, containments, references, parent }: LionWebJsonNode): LionWebJsonNode => ({
        id,
        classifier,
        properties,
        containments,
        references,
        annotations: [],
        parent
    })
    return {
        serializationFormatVersion,
        languages,
        nodes: nodes
            .filter((node) => !idsOfNodesToDelete.includes(node.id)) // removes instances of annotations
            .map(withoutAnnotations)
    }
}

