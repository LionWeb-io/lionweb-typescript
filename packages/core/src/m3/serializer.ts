import { LionWebJsonChunk } from "@lionweb/json"
import { serializerWith } from "../serializer.js"
import { lioncoreReaderFor } from "./reading-writing.js"
import { Language } from "./types.js"
import { defaultLionWebVersion, LionWebVersion, LionWebVersions } from "./version.js"


/**
 * Type def. for objects that contain all necessary data to deserialize one or more languages from a {@link LionWebJsonChunk serialization chunk}.
 */
export type LanguageSerializationData = {
    /**
     * The version of the LionWeb serialization format to serialize in.
     * Default = {@link defaultLionWebVersion}.
     */
    lionWebVersion?: LionWebVersion
    languages: Language[]
}

/**
 * @return the {@link LionWebJsonChunk serialization chunk} serializing the given languages (M2s, as instances of the LionCore M3),
 * according to the configured {@link LionWebVersion} (which itself defaults to {@link defaultLionWebVersion}).
 */
export const serializeLanguagesFor = (data: LanguageSerializationData) => {
    const lionwebVersion = data.lionWebVersion ?? defaultLionWebVersion
    return serializerWith({ reader: lioncoreReaderFor(lionwebVersion) })(data.languages)
}

/**
 * Serializes languages (i.e., instances of the LionCore metametamodel, using {@link M3Concept these type definitions})
 * into the LionWeb serialization JSON format.
 */
export const serializeLanguages = (...languages: Language[]): LionWebJsonChunk =>
    serializerWith({ reader: lioncoreReaderFor(LionWebVersions.v2023_1) })(languages)

