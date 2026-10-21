import type { LionWebJsonChunk, LionWebJsonMetaPointer, LionWebJsonUsedLanguage } from "@lionweb/json"

import { PBChunk, PBLanguage, PBMetaPointer, PBNode } from "./proto/Chunk.g.js"

/** Converts a protobuf chunk (see `proto/Chunk.proto`) to the equivalent LionWeb JSON chunk. */
export const convertPBChunkToJsonChunk = (pbChunk: PBChunk): LionWebJsonChunk => {
    // Interned strings and languages are indexed 1-based, with 0 (or an absent index) meaning null; meta-pointers 0-based.
    const outOfRange = (kind: string, index: number, size: number) =>
        new Error(`Invalid protobuf chunk: ${kind} index ${index} is out of range (${size} interned)`)
    const strings = pbChunk.internedStrings
    const stringAt = (index: number | undefined): string | null => {
        if (index === undefined || index === 0) {
            return null
        }
        if (index > strings.length) {
            throw outOfRange("string", index, strings.length)
        }
        return strings[index - 1]
    }
    const idAt = (index: number | undefined): string => {
        const id = stringAt(index)
        if (id === null) {
            throw new Error("Invalid protobuf chunk: missing node ID")
        }
        return id
    }
    // As LionWeb Java does, languages and meta-pointers may have null parts (e.g. language index 0 meaning null).
    const languages = pbChunk.internedLanguages.map(
        ({ siKey, siVersion }) => ({ key: stringAt(siKey), version: stringAt(siVersion) }) as LionWebJsonUsedLanguage
    )
    const metaPointers = pbChunk.internedMetaPointers.map(({ liLanguage, siKey }): LionWebJsonMetaPointer => {
        if (liLanguage > languages.length) {
            throw outOfRange("language", liLanguage, languages.length)
        }
        const language = liLanguage === 0 ? undefined : languages[liLanguage - 1]
        return { language: language?.key ?? null, version: language?.version ?? null, key: stringAt(siKey) } as LionWebJsonMetaPointer
    })
    const metaPointerAt = (index: number): LionWebJsonMetaPointer => {
        if (index >= metaPointers.length) {
            throw outOfRange("meta-pointer", index, metaPointers.length)
        }
        return metaPointers[index]
    }

    return {
        serializationFormatVersion: pbChunk.serializationFormatVersion,
        languages,
        nodes: pbChunk.nodes.map(node => {
            return {
                id: idAt(node.siId),
                parent: stringAt(node.siParent),
                classifier: metaPointerAt(node.mpiClassifier),
                annotations: node.siAnnotations.map(idAt),
                properties: node.properties.map(({ mpiMetaPointer, siValue }) => ({
                    property: metaPointerAt(mpiMetaPointer),
                    value: stringAt(siValue)
                })),
                containments: node.containments.map(({ mpiMetaPointer, siChildren }) => ({
                    containment: metaPointerAt(mpiMetaPointer),
                    children: siChildren.map(idAt)
                })),
                references: node.references.map(({ mpiMetaPointer, values }) => ({
                    reference: metaPointerAt(mpiMetaPointer),
                    targets: values.map(({ siReferred, siResolveInfo }) => {
                        const reference = stringAt(siReferred)
                        const resolveInfo = stringAt(siResolveInfo)
                        return reference === null ? { reference: null, resolveInfo: resolveInfo ?? "" } : { reference, resolveInfo }
                    })
                }))
            }
        })
    }
}

export type EncodeOptions = {
    /**
     * Whether to omit properties whose value is null, containments without children and references without targets,
     * as LionWeb Java does with `serializeEmptyFeatures` set to false. Omitted features read back as absent, so the
     * decoded chunk is equivalent to, but no longer equal to the encoded one.
     * Default: `false`.
     */
    omitEmptyFeatures?: boolean
}

/**
 * Converts a LionWeb JSON chunk to the equivalent protobuf chunk: the inverse of {@link convertPBChunkToJsonChunk}.
 * Strings and languages are interned with index 0 meaning null; meta-pointers are interned 0-based.
 */
export const convertJsonChunkToPBChunk = (chunk: LionWebJsonChunk, options: EncodeOptions = {}): PBChunk => {
    const omitEmptyFeatures = options.omitEmptyFeatures ?? false

    /**
     * @return a function that interns values (identified by `keyOf`) in the `interned` array, as `intern` converts them,
     * and returns their index — the first one being `firstIndex`.
     */
    const interner = <T, I>(interned: I[], keyOf: (value: T) => string, intern: (value: T) => I, firstIndex: number) => {
        const indices = new Map<string, number>()
        return (value: T): number => {
            const key = keyOf(value)
            let index = indices.get(key)
            if (index === undefined) {
                interned.push(intern(value))
                index = interned.length - 1 + firstIndex
                indices.set(key, index)
            }
            return index
        }
    }

    const strings: string[] = []
    const internString = interner<string, string>(
        strings,
        value => value,
        value => value,
        1
    )
    const stringIndex = (value: string | null | undefined): number | undefined =>
        value === null || value === undefined ? undefined : internString(value)

    const languages: PBLanguage[] = []
    const internLanguage = interner<LionWebJsonUsedLanguage, PBLanguage>(
        languages,
        ({ key, version }) => JSON.stringify([key, version]),
        ({ key, version }) => ({ siKey: stringIndex(key), siVersion: stringIndex(version) }),
        1
    )
    const li = ({ key, version }: LionWebJsonUsedLanguage): number =>
        (key === null || key === undefined) && (version === null || version === undefined) ? 0 : internLanguage({ key, version })

    const metaPointers: PBMetaPointer[] = []
    const mpi = interner<LionWebJsonMetaPointer, PBMetaPointer>(
        metaPointers,
        ({ language, version, key }) => JSON.stringify([language, version, key]),
        ({ language, version, key }) => ({ liLanguage: li({ key: language, version }), siKey: stringIndex(key) }),
        0
    )

    // Languages first, so that they keep the order of the chunk.
    chunk.languages.forEach(li)
    const nodes = chunk.nodes.map(
        (node): PBNode => ({
            siId: stringIndex(node.id),
            mpiClassifier: mpi(node.classifier),
            properties: node.properties
                .filter(property => !omitEmptyFeatures || property.value !== null)
                .map(property => ({ mpiMetaPointer: mpi(property.property), siValue: stringIndex(property.value) })),
            containments: node.containments
                .filter(containment => !omitEmptyFeatures || containment.children.length > 0)
                .map(containment => ({ mpiMetaPointer: mpi(containment.containment), siChildren: containment.children.map(internString) })),
            references: node.references
                .filter(reference => !omitEmptyFeatures || reference.targets.length > 0)
                .map(reference => ({
                    mpiMetaPointer: mpi(reference.reference),
                    values: reference.targets.map(target => ({
                        siReferred: stringIndex(target.reference),
                        siResolveInfo: stringIndex(target.resolveInfo)
                    }))
                })),
            siAnnotations: node.annotations.map(internString),
            siParent: stringIndex(node.parent)
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
export const decodeChunk = (bytes: Uint8Array): LionWebJsonChunk => convertPBChunkToJsonChunk(PBChunk.decode(bytes))

/** Encodes a LionWeb JSON chunk into the bytes of a `.binpb` file. */
export const encodeChunk = (chunk: LionWebJsonChunk, options: EncodeOptions = {}): Uint8Array =>
    PBChunk.encode(convertJsonChunkToPBChunk(chunk, options)).finish()
