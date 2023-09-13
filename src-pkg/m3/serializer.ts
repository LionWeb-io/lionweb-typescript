import {Language} from "./types.js"
import {SerializationChunk} from "../serialization.js"
import {serializeNodes} from "../serializer.js"
import {lioncoreAPI} from "./api.js"


/**
 * Serializes a language (i.e., an instance of the LIonCore/M3 metametamodel,
 * using {@link M3Concept these type definitions})
 * into the LIonWeb serialization JSON format.
 */
export const serializeLanguage = (language: Language): SerializationChunk =>
    serializeNodes([language], lioncoreAPI)

