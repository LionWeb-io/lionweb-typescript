import { LionWebJsonChunk } from "@lionweb/json"
import { sortByStringKey } from "@lionweb/ts-utils"
import { orderedMetaPointer, orderedSerializedLanguageReference, orderedSerializedProperty, orderedSerializedReferenceTarget } from "./ordering.js"


/**
 * @return A sorted version of a {@link SerializedModel JSON serialization}, which should make it easier to inspect.
 *  Note that the sorted version destroy the order of links, which might effectively alter semantics.
 */
export const sortedSerializationChunk = ({serializationFormatVersion, languages, nodes}: LionWebJsonChunk): LionWebJsonChunk =>
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
                            children: children.sort()
                        })),
                references: sortByStringKey(node.references, ({reference}) => reference.key)
                        .map(({reference, targets}) => ({
                            reference: orderedMetaPointer(reference),
                            targets: sortByStringKey(targets, ({reference}) => reference).map(orderedSerializedReferenceTarget)
                        })),
                annotations: node.annotations.sort(),
                parent: node.parent
            }))
    })

