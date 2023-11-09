import {
    MetaPointer,
    SerializationChunk,
    SerializedLanguageReference,
    SerializedReferenceTarget,
    sortByStringKey
} from "@lionweb/core"


/**
 * @return A shortened version of a {@link SerializedModel JSON serialization}, which should make it easier to inspect.
 *  Note that the shortened version doesn't contain all information, and could (in theory) be malformed.
 */
export const shortenedSerialization = ({nodes}: SerializationChunk) =>
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


const sortedMetaPointer = ({language, version, key}: MetaPointer): MetaPointer =>
    ({
        language,
        version,
        key
    })

const sortedSerializedLanguageReference = ({key, version}: SerializedLanguageReference): SerializedLanguageReference =>
    ({
        key,
        version
    })

const sortedSerializedReferenceTarget = ({reference, resolveInfo}: SerializedReferenceTarget): SerializedReferenceTarget =>
    ({
        reference,
        resolveInfo
    })

const pick = <T, K extends keyof T>(key: K): (t: T) => T[K] =>
    (t: T) => t[key]
// TODO  (find a nice way to compose such things)

/**
 * @return A sorted version of a {@link SerializedModel JSON serialization}, which should make it easier to inspect.
 *  Note that the sorted version destroy the order of links, which might effectively alter semantics.
 */
export const sortedSerialization = ({serializationFormatVersion, languages, nodes}: SerializationChunk): SerializationChunk =>
    ({
        serializationFormatVersion,
        languages: sortByStringKey(languages, pick("key")).map(sortedSerializedLanguageReference),
        nodes: sortByStringKey(nodes, pick("id"))
            .map((node) => ({
                id: node.id,
                classifier: sortedMetaPointer(node.classifier),
                properties: sortByStringKey(node.properties, ({property}) => property.key),
                containments: sortByStringKey(node.containments, ({containment}) => containment.key)
                        .map(({containment, children}) => ({
                            containment,
                            children: children.sort()
                        })),
                references: sortByStringKey(node.references, ({reference}) => reference.key)
                        .map(({reference, targets}) => ({
                            reference,
                            targets: sortByStringKey(targets, pick("reference")).map(sortedSerializedReferenceTarget)
                        })),
                parent: node.parent
            }))
    })

