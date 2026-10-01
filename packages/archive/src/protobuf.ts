import type {
    LionWebJsonChunk,
    LionWebJsonProperty,
    LionWebJsonReference,
    LionWebJsonReferenceTarget,
    LionWebJsonContainment,
    LionWebJsonMetaPointer,
    LionWebJsonNode,
    LionWebJsonUsedLanguage
} from "@lionweb/json"
import { PBChunk, PBLanguage, PBMetaPointer, PBNode } from "./proto/Chunk.js"

/** Converts a protobuf chunk (see `proto/Chunk.proto`) to the equivalent LionWeb JSON chunk. */
export function convertPBChunkToJsonChunk(pbChunk: PBChunk): LionWebJsonChunk {
    const { internedStrings: preInternedStrings, internedLanguages, internedMetaPointers, nodes } = pbChunk

    const internedStrings: (string | null)[] = new Array(preInternedStrings.length + 1)
    internedStrings[0] = null
    for (let i = 0; i < preInternedStrings.length; i++) {
        internedStrings[i + 1] = preInternedStrings[i]
    }

    // Pre-compute all language mappings
    const languagesArray: (LionWebJsonUsedLanguage | null)[] = new Array(internedLanguages.length + 1)
    languagesArray[0] = null
    for (let i = 0; i < internedLanguages.length; i++) {
        const pbLanguage = internedLanguages[i]
        languagesArray[i + 1] = {
            key: pbLanguage.siKey == undefined ? undefined : internedStrings[pbLanguage.siKey],
            version: pbLanguage.siVersion == undefined ? undefined : internedStrings[pbLanguage.siVersion]
        } as LionWebJsonUsedLanguage
    }

    // Pre-compute all metapointer mappings using arrays instead of Map
    const metaPointersArray = new Array(internedMetaPointers.length)
    for (let i = 0; i < internedMetaPointers.length; i++) {
        const pbMetaPointer = internedMetaPointers[i]
        const languageVersion = languagesArray[pbMetaPointer.liLanguage]
        metaPointersArray[i] = {
            language: languageVersion == undefined ? null : languageVersion.key,
            version: languageVersion == undefined ? null : languageVersion.version,
            key: pbMetaPointer.siKey == undefined ? undefined : internedStrings[pbMetaPointer.siKey]
        }
    }

    // Convert nodes with pre-allocated array
    const convertedNodes: LionWebJsonNode[] = new Array(nodes.length)
    for (let i = 0; i < nodes.length; i++) {
        const pbNode = nodes[i]
        const { properties, containments, references } = pbNode

        // Pre-allocate nested arrays
        const convertedProperties: LionWebJsonProperty[] = new Array(properties.length)
        const convertedContainments: LionWebJsonContainment[] = new Array(containments.length)
        const convertedReferences: LionWebJsonReference[] = new Array(references.length)

        // Convert properties
        for (let j = 0; j < properties.length; j++) {
            const p = properties[j]
            convertedProperties[j] = {
                property: metaPointersArray[p.mpiMetaPointer],
                value: p.siValue == undefined ? null : internedStrings[p.siValue]
            }
        }

        // Convert containments
        for (let j = 0; j < containments.length; j++) {
            const c = containments[j]
            const convertedChildren = new Array(c.siChildren.length)
            for (let k = 0; k < c.siChildren.length; k++) {
                convertedChildren[k] = internedStrings[c.siChildren[k]]
            }
            convertedContainments[j] = {
                containment: metaPointersArray[c.mpiMetaPointer],
                children: convertedChildren
            }
        }

        // Convert references
        for (let j = 0; j < references.length; j++) {
            const r = references[j]
            const convertedTargets: LionWebJsonReferenceTarget[] = new Array(r.values.length)
            for (let k = 0; k < r.values.length; k++) {
                const rv = r.values[k]
                const reference = rv.siReferred == undefined ? null : internedStrings[rv.siReferred]
                const resolveInfo = rv.siResolveInfo == undefined ? null : internedStrings[rv.siResolveInfo]
                convertedTargets[k] = reference == null ? { reference: null, resolveInfo: resolveInfo ?? "" } : { reference, resolveInfo }
            }
            convertedReferences[j] = {
                reference: metaPointersArray[r.mpiMetaPointer],
                targets: convertedTargets
            }
        }

        const convertedAnnotations = new Array(pbNode.siAnnotations.length)
        for (let j = 0; j < convertedAnnotations.length; j++) {
            convertedAnnotations[j] = internedStrings[pbNode.siAnnotations[j]]
        }

        const id = pbNode.siId == undefined ? null : internedStrings[pbNode.siId]
        if (!id) throw new Error("Protobuf node has no ID")
        convertedNodes[i] = {
            id,
            parent: pbNode.siParent == undefined ? null : internedStrings[pbNode.siParent],
            classifier: metaPointersArray[pbNode.mpiClassifier],
            annotations: convertedAnnotations,
            properties: convertedProperties,
            containments: convertedContainments,
            references: convertedReferences
        }
    }

    return {
        serializationFormatVersion: pbChunk.serializationFormatVersion,
        languages: languagesArray.filter(l => l != null) as LionWebJsonUsedLanguage[],
        nodes: convertedNodes
    }
}

export type EncodeOptions = {
    /**
     * Whether to omit properties whose value is null, containments without children and references without targets,
     * as LionWeb Java does with `serializeEmptyFeatures` set to false. Omitted features read back as absent, so the
     * decoded chunk is equivalent to, but no longer equal to the encoded one. Default: false.
     */
    omitEmptyFeatures?: boolean
}

/**
 * Converts a LionWeb JSON chunk to the equivalent protobuf chunk: the inverse of {@link convertPBChunkToJsonChunk}.
 * Strings and languages are interned with index 0 meaning null; meta-pointers are interned 0-based.
 */
export function convertJsonChunkToPBChunk(chunk: LionWebJsonChunk, options: EncodeOptions = {}): PBChunk {
    const omitEmptyFeatures = options.omitEmptyFeatures ?? false
    const strings: string[] = []
    const stringIndices = new Map<string, number>()
    const si = (value: string | null | undefined): number | undefined => {
        if (value == null) {
            return undefined
        }
        let index = stringIndices.get(value)
        if (index === undefined) {
            strings.push(value)
            index = strings.length
            stringIndices.set(value, index)
        }
        return index
    }

    const languages: PBLanguage[] = []
    const languageIndices = new Map<string, number>()
    const li = (key: string | null | undefined, version: string | null | undefined): number => {
        if (key == null && version == null) {
            return 0
        }
        const id = JSON.stringify([key, version])
        let index = languageIndices.get(id)
        if (index === undefined) {
            languages.push({ siKey: si(key), siVersion: si(version) })
            index = languages.length
            languageIndices.set(id, index)
        }
        return index
    }

    const metaPointers: PBMetaPointer[] = []
    const metaPointerIndices = new Map<string, number>()
    const mpi = (metaPointer: LionWebJsonMetaPointer): number => {
        const id = JSON.stringify([metaPointer.language, metaPointer.version, metaPointer.key])
        let index = metaPointerIndices.get(id)
        if (index === undefined) {
            metaPointers.push({ liLanguage: li(metaPointer.language, metaPointer.version), siKey: si(metaPointer.key) })
            index = metaPointers.length - 1
            metaPointerIndices.set(id, index)
        }
        return index
    }

    // Languages first, so that they keep the order of the chunk.
    chunk.languages.forEach(language => li(language.key, language.version))
    const nodes = chunk.nodes.map(
        (node): PBNode => ({
            siId: si(node.id),
            mpiClassifier: mpi(node.classifier),
            properties: node.properties
                .filter(property => !omitEmptyFeatures || property.value !== null)
                .map(property => ({ mpiMetaPointer: mpi(property.property), siValue: si(property.value) })),
            containments: node.containments
                .filter(containment => !omitEmptyFeatures || containment.children.length > 0)
                .map(containment => ({
                    mpiMetaPointer: mpi(containment.containment),
                    siChildren: containment.children.map(id => si(id)!)
                })),
            references: node.references
                .filter(reference => !omitEmptyFeatures || reference.targets.length > 0)
                .map(reference => ({
                    mpiMetaPointer: mpi(reference.reference),
                    values: reference.targets.map(target => ({ siReferred: si(target.reference), siResolveInfo: si(target.resolveInfo) }))
                })),
            siAnnotations: node.annotations.map(id => si(id)!),
            siParent: si(node.parent)
        })
    )

    return {
        serializationFormatVersion: chunk.serializationFormatVersion,
        internedStrings: strings,
        internedMetaPointers: metaPointers,
        internedLanguages: languages,
        nodes
    }
}

/** Decodes the bytes of a `.binpb` file into a LionWeb JSON chunk. */
export function decodeChunk(bytes: Uint8Array): LionWebJsonChunk {
    return convertPBChunkToJsonChunk(PBChunk.decode(bytes))
}

/** Encodes a LionWeb JSON chunk into the bytes of a `.binpb` file. */
export function encodeChunk(chunk: LionWebJsonChunk, options: EncodeOptions = {}): Uint8Array {
    return PBChunk.encode(convertJsonChunkToPBChunk(chunk, options)).finish()
}
