import {Language} from "./types.ts"
import {SerializedModel} from "../serialization.ts"
import {serializeModel} from "../serializer.ts"
import {lioncoreAPI} from "./api.ts"


/**
 * Serializes a language (i.e., an instance of the LIonCore/M3 metametamodel,
 * using {@link M3Concept these type definitions})
 * into the LIonWeb serialization JSON format.
 */
export const serializeLanguage = (language: Language): SerializedModel =>
    serializeModel([language], lioncoreAPI)

