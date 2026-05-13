import {
    LionWebJsonChunk,
    LionWebJsonContainment,
    LionWebJsonMetaPointer,
    LionWebJsonNode,
    LionWebJsonProperty,
    LionWebJsonReference,
    LionWebJsonReferenceTarget,
    LionWebJsonUsedLanguage
} from "@lionweb/json"
import { mappedComparer, mappedLexiComparer, regularStringComparer, sorterWith } from "@lionweb/ts-utils"
import { orderedMetaPointer, orderedSerializedLanguageReference, orderedSerializedReferenceTarget } from "./ordering.js"


const sortedUsedLanguages = sorterWith<LionWebJsonUsedLanguage>(mappedLexiComparer([({key}) => key, ({version}) => version], regularStringComparer))
const sortedNodes = sorterWith<LionWebJsonNode>(mappedComparer(({id}) => id, regularStringComparer))
const metaPointerComparer = mappedLexiComparer<LionWebJsonMetaPointer, string>([({language}) => language, ({version}) => version, ({key}) => key], regularStringComparer)
const sortedProperties = sorterWith<LionWebJsonProperty>(mappedComparer(({property}) => property, metaPointerComparer))
const sortedContainments = sorterWith<LionWebJsonContainment>(mappedComparer(({containment}) => containment, metaPointerComparer))
const sortedReferences = sorterWith<LionWebJsonReference>(mappedComparer(({reference}) => reference, metaPointerComparer))
const sortedTargets = sorterWith<LionWebJsonReferenceTarget>(mappedComparer(({reference, resolveInfo}) => (reference ?? resolveInfo)!, regularStringComparer))

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
        languages: sortedUsedLanguages(languages)
            .map(orderedSerializedLanguageReference),
        nodes: sortedNodes(nodes)
            .map((node) => ({
                id: node.id,
                classifier: orderedMetaPointer(node.classifier),
                properties: sortedProperties(node.properties),
                containments: sortedContainments(node.containments)
                        .map(({containment, children}) => ({
                            containment: orderedMetaPointer(containment),
                            children: sortConnections ? children.sort() : children
                        })),
                references: sortedReferences(node.references)
                        .map(({reference, targets}) => ({
                            reference: orderedMetaPointer(reference),
                            targets: sortConnections
                                ? sortedTargets(targets).map(orderedSerializedReferenceTarget)
                                : targets
                        })),
                annotations: sortConnections ? node.annotations.sort() : node.annotations,
                parent: node.parent
            }))
    })

