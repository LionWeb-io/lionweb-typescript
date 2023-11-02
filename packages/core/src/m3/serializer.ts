import {Language} from "./types.js"
import {SerializationChunk} from "../serialization.js"
import {serializeNodes} from "../serializer.js"
import {lioncoreExtractionFacade} from "./facade.js"


/**
 * Serializes languages (i.e., instances of the LionCore metametamodel, using {@link M3Concept these type definitions})
 * into the LionWeb serialization JSON format.
 */
export const serializeLanguages = (...languages: Language[]): SerializationChunk =>
    serializeNodes(languages, lioncoreExtractionFacade)

