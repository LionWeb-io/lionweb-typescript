import {Language} from "./types.js"
import {SerializationChunk} from "../serialization.js"
import {serializeNodes} from "../serializer.js"
import {lioncoreReadAPI} from "./api.js"


/**
 * Serializes a language (i.e., an instance of the LionCore metametamodel,
 * using {@link M3Concept these type definitions})
 * into the LionWeb serialization JSON format.
 */
export const serializeLanguage = (language: Language): SerializationChunk =>
    serializeNodes([language], lioncoreReadAPI)

