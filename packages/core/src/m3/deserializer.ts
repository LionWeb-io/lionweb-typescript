import {deserializeSerializationChunk} from "../deserializer.js"
import {nodesExtractorUsing} from "../facade.js"
import {defaultSimplisticHandler, SimplisticHandler} from "../handler.js"
import {SerializationChunk} from "../serialization.js"
import {DefaultPrimitiveTypeDeserializer, lioncoreBuiltins} from "./builtins.js"
import {lioncoreExtractionFacade, lioncoreInstantiationFacade} from "./facade.js"
import {lioncore} from "./lioncore.js"
import {Language} from "./types.js"


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

