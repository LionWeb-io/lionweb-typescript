import { LionWebJsonChunk } from "@lionweb/json"
import { deserializerWith } from "../deserializer.js"
import { nodesExtractorUsing } from "../extraction.js"
import { defaultSimplisticHandler, SimplisticHandler } from "../handler.js"
import { lioncoreBuiltins } from "./builtins.js"
import { lioncoreReader, lioncoreWriter } from "./facade.js"
import { lioncore } from "./lioncore.js"
import { Language } from "./types.js"


/**
 * Deserializes languages that have been serialized into the LionWeb serialization JSON format
 * as an instance of the LionCore metametamodel, using {@link _M3Concept these type definitions}.
 */
export const deserializeLanguages = (serializationChunk: LionWebJsonChunk, ...dependentLanguages: Language[]): Language[] =>
    deserializeLanguagesWithHandler(serializationChunk, defaultSimplisticHandler, ...dependentLanguages)

/**
 * Deserializes languages that have been serialized into the LionWeb serialization JSON format
 * as an instance of the LionCore metametamodel, using {@link _M3Concept these type definitions}.
 * This function takes a handler to be able to see what problems occurred.
 */
export const deserializeLanguagesWithHandler = (
    serializationChunk: LionWebJsonChunk,
    problemHandler: SimplisticHandler,
    ...dependentLanguages: Language[]
): Language[] =>
    deserializerWith({
        writer: lioncoreWriter,
        languages: [lioncore, ...dependentLanguages],
        problemHandler
    })(
        serializationChunk,
        [lioncoreBuiltins, ...dependentLanguages].flatMap(nodesExtractorUsing(lioncoreReader)),
    )
        .filter((rootNode) => rootNode instanceof Language)
        .map((language) => (language as Language).dependingOn(...dependentLanguages))

