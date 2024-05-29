import {Language} from "./types.js"
import {SerializationChunk} from "../serialization.js"
import {lioncoreExtractionFacade, lioncoreInstantiationFacade} from "./facade.js"
import {nodesExtractorUsing} from "../facade.js"
import {deserializeSerializationChunk} from "../deserializer.js"
import {lioncore} from "./lioncore.js"
import { lioncoreBuiltins } from "./builtins.js"

/**
 * Deserializes languages that have been serialized into the LionWeb serialization JSON format
 * as an instance of the LionCore metametamodel, using {@link _M3Concept these type definitions}.
 */
export const deserializeLanguages = (serializationChunk: SerializationChunk, ...dependentLanguages: Language[]): Language[] =>
    deserializeSerializationChunk(
        serializationChunk,
        lioncoreInstantiationFacade,
        [lioncore],
        [lioncoreBuiltins, ...dependentLanguages].flatMap(nodesExtractorUsing(lioncoreExtractionFacade))
    )
        .filter((rootNode) => rootNode instanceof Language)
        .map((language) => (language as Language).dependingOn(...dependentLanguages))
// TODO  pass a function that can resolve dependent metamodels, since they'd generally only known in the serialization

