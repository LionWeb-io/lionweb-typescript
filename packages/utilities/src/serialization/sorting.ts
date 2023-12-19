import {SerializationChunk, sortByStringKey} from "@lionweb/core"
import {
    orderedMetaPointer,
    orderedSerializedLanguageReference,
    orderedSerializedProperty,
    orderedSerializedReferenceTarget
} from "./ordering.js"


const pick = <T, K extends keyof T>(key: K): (t: T) => T[K] =>
    (t: T) => t[key]
// TODO  (find a nice way to compose such things)

/**
 * @return A sorted version of a {@link SerializedModel JSON serialization}, which should make it easier to inspect.
 *  Note that the sorted version destroy the order of links, which might effectively alter semantics.
 */
export const sortedSerializationChunk = ({serializationFormatVersion, languages, nodes}: SerializationChunk): SerializationChunk =>
    ({
        serializationFormatVersion,
        languages: sortByStringKey(languages, pick("key")).map(orderedSerializedLanguageReference),
        nodes: sortByStringKey(nodes, pick("id"))
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
                            targets: sortByStringKey(targets, pick("reference")).map(orderedSerializedReferenceTarget)
                        })),
                annotations: node.annotations.sort(),
                parent: node.parent
            }))
    })

