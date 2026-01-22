import { LionWebJsonChunk } from "@lionweb/json"
import { deserializerWith } from "../deserializer.js"
import { nodesExtractorUsing } from "../extraction.js"
import { consoleProblemReporter, ProblemReporter } from "../reporter.js"
import { lioncoreBuiltinsFacade } from "./builtins.js"
import { lioncoreReader, lioncoreWriter } from "./facade.js"
import { lioncore } from "./lioncore.js"
import { Language } from "./types.js"


/**
 * Deserializes languages that have been serialized into the LionWeb serialization JSON format
 * as an instance of the LionCore metametamodel, using {@link _M3Concept these type definitions}.
 */
export const deserializeLanguages = (serializationChunk: LionWebJsonChunk, ...dependentLanguages: Language[]): Language[] =>
    deserializeLanguagesWithReporter(serializationChunk, consoleProblemReporter, ...dependentLanguages)

/**
 * Deserializes languages that have been serialized into the LionWeb serialization JSON format
 * as an instance of the LionCore metametamodel, using {@link _M3Concept these type definitions}.
 * This function takes a {@link ProblemReporter} to be able to see what problems occurred.
 */
export const deserializeLanguagesWithReporter = (
    serializationChunk: LionWebJsonChunk,
    problemReporter: ProblemReporter,
    ...dependentLanguages: Language[]
): Language[] =>
    deserializerWith({
        writer: lioncoreWriter,
        languages: [lioncore, ...dependentLanguages],
        problemReporter: problemReporter
    })(
        serializationChunk,
        [lioncoreBuiltinsFacade.language, ...dependentLanguages].flatMap(nodesExtractorUsing(lioncoreReader)),
    )
        .filter((rootNode) => rootNode instanceof Language)
        .map((language) => (language as Language).dependingOn(...dependentLanguages))

/**
 * Legacy alias for {@link deserializeLanguagesWithReporter}, kept for backward compatibility, and to be deprecated and removed later.
 */
export const deserializeLanguagesWithHandler = deserializeLanguagesWithReporter

