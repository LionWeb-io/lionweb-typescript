import {Language} from "./types.js"
import {SerializationChunk} from "../serialization.js"
import {lioncoreExtractionFacade, lioncoreInstantiationFacade} from "./facade.js"
import {nodesExtractorUsing} from "../facade.js"
import {defaultSimplisticHandler, deserializeSerializationChunk, SimplisticHandler} from "../deserializer.js"
import {lioncore} from "./lioncore.js"
import {DefaultPrimitiveTypeDeserializer, lioncoreBuiltins} from "./builtins.js"

/**
 * Deserializes languages that have been serialized into the LionWeb serialization JSON format
 * as an instance of the LionCore metametamodel, using {@link _M3Concept these type definitions}.
 */
export const deserializeLanguages = (serializationChunk: SerializationChunk, ...dependentLanguages: Language[]): Language[] =>
    deserializeLanguagesWithHandler(serializationChunk, defaultSimplisticHandler, ...dependentLanguages)

/**
 * Deserializes languages that have been serialized into the LionWeb serialization JSON format
 * as an instance of the LionCore metametamodel, using {@link _M3Concept these type definitions}.
 * This function takes a handler to be able to see what problems occurred.
 */
export const deserializeLanguagesWithHandler = (
    serializationChunk: SerializationChunk,
    handler: SimplisticHandler,
    ...dependentLanguages: Language[]
): Language[] =>
    deserializeSerializationChunk(
        serializationChunk,
        lioncoreInstantiationFacade,
        [lioncore, ...dependentLanguages],
        [lioncoreBuiltins, ...dependentLanguages].flatMap(nodesExtractorUsing(lioncoreExtractionFacade)),
        new DefaultPrimitiveTypeDeserializer(),
        handler
    )
        .filter((rootNode) => rootNode instanceof Language)
        .map((language) => (language as Language).dependingOn(...dependentLanguages))

