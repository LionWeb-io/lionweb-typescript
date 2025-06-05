import { LionWebJsonChunk } from "@lionweb/json"
import { nodeSerializer } from "../serializer.js"
import { lioncoreReader } from "./facade.js"
import { Language } from "./types.js"


/**
 * Serializes languages (i.e., instances of the LionCore metametamodel, using {@link M3Concept these type definitions})
 * into the LionWeb serialization JSON format.
 */
export const serializeLanguages = (...languages: Language[]): LionWebJsonChunk =>
    nodeSerializer(lioncoreReader)(languages)

