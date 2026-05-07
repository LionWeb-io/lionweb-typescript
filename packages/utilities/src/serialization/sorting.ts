import { LionWebJsonChunk } from "@lionweb/json"
import { sortByStringKey } from "@lionweb/ts-utils"
import {
    orderedMetaPointer,
    orderedSerializedLanguageReference,
    orderedSerializedProperty,
    orderedSerializedReferenceTarget
} from "./ordering.js"


/**
 * @return A sorted version of a {@link LionWebJsonChunk serialization chunk}, meaning:
 *
 *  - All nodes sorted by ID.
 *  - For all nodes, their properties, containments, and references are sorted lexicographically by the tuple (language-key, feature-key, language-version) — essentially, by the meta-pointer.
 *  - If the `sortConnections` argument is `true`, then for every node, all containments, references, and contained annotations are sorted by ID.
 *  All key-value pairs in the objects in the JSON produced, appear according to the specification of the LionWeb serialization format, with missing key-value pairs put in with their default values.
 *
 * Sorted serialization chunks lean themselves well to being compared as text files.
 * Setting `sortConnections` to `true` usually changes the meaning of the serialization chunk, but makes it easy to find out whether a list of items appearing in a containment, a reference, or the annotations of a node merely appear in a different order, or really differ.
 */
export const sortedSerializationChunk = ({serializationFormatVersion, languages, nodes}: LionWebJsonChunk, sortConnections?: boolean): LionWebJsonChunk =>
    ({
        serializationFormatVersion,
        languages: sortByStringKey(languages, ({key}) => key).map(orderedSerializedLanguageReference),
        nodes: sortByStringKey(nodes, ({id}) => id)
            .map((node) => ({
                id: node.id,
                classifier: orderedMetaPointer(node.classifier),
                properties: sortByStringKey(node.properties, ({property}) => property.key).map(orderedSerializedProperty),
                containments: sortByStringKey(node.containments, ({containment}) => containment.key)
                        .map(({containment, children}) => ({
                            containment: orderedMetaPointer(containment),
                            children: sortConnections ? children.sort() : children
                        })),
                references: sortByStringKey(node.references, ({reference}) => reference.key)
                        .map(({reference, targets}) => ({
                            reference: orderedMetaPointer(reference),
                            targets: sortConnections
                                ? sortByStringKey(targets, ({reference, resolveInfo}) => (reference ?? resolveInfo)!).map(orderedSerializedReferenceTarget)
                                : targets
                        })),
                annotations: sortConnections ? node.annotations.sort() : node.annotations,
                parent: node.parent
            }))
    })

