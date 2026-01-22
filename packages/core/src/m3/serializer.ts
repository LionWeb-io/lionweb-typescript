import { LionWebJsonChunk } from "@lionweb/json"
import { serializerWith } from "../serializer.js"
import { lioncoreReader } from "./reading-writing.js"
import { Language } from "./types.js"


/**
 * Serializes languages (i.e., instances of the LionCore metametamodel, using {@link M3Concept these type definitions})
 * into the LionWeb serialization JSON format.
 */
export const serializeLanguages = (...languages: Language[]): LionWebJsonChunk =>
    serializerWith({ reader: lioncoreReader })(languages)

