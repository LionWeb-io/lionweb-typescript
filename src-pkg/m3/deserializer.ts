import {Language} from "./types.js"
import {SerializationChunk} from "../serialization.js"
import {lioncoreAPI} from "./api.js"
import {nodesExtractorUsing} from "../api.js"
import {deserializeModel} from "../deserializer.js"
import {lioncore} from "./lioncore.js"
import {lioncoreBuiltins} from "./builtins.js"


/**
 * Deserializes a language that's serialized into the LIonWeb serialization JSON format
 * as an instance of the LIonCore/M3 metametamodel, using {@link _M3Concept these type definitions}.
 */
export const deserializeLanguage = (serializationChunk: SerializationChunk, ...dependentMetamodels: Language[]): Language => {
    const language = deserializeModel(
        serializationChunk,
        lioncoreAPI,
        lioncore,
        [lioncoreBuiltins, ...dependentMetamodels].flatMap(nodesExtractorUsing(lioncoreAPI))
    )[0] as Language
    language.dependingOn(...dependentMetamodels)
    return language
}
// TODO  pass a function that can resolve dependent metamodels, since they'd generally only known in the serialization

