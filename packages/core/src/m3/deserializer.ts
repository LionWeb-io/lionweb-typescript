import { LionWebJsonChunk } from "@lionweb/json"
import { deserializerWith } from "../deserializer.js"
import { nodesExtractorUsing } from "../extraction.js"
import { consoleProblemReporter, ProblemReporter } from "../reporter.js"
import { lioncoreBuiltinsFacade } from "./builtins.js"
import { lioncoreFacade } from "./lioncore.js"
import { lioncoreReaderFor, lioncoreWriterFor } from "./reading-writing.js"
import { Language } from "./types.js"
import { defaultLionWebVersion, LionWebVersion } from "./version.js"


/**
 * Type def. for objects that contain all necessary data to deserialize one or more languages from a {@link LionWebJsonChunk serialization chunk}.
 */
export type LanguageDeserializationData = {
    serializationChunk: LionWebJsonChunk
    /**
     * The version of the LionWeb serialization format to deserialize from.
     * Default = {@link defaultLionWebVersion}.
     */
    lionWebVersion?: LionWebVersion
    dependentLanguages?: Language[]
    /**
     * Default = {@link consoleProblemReporter}.
     */
    problemReporter?: ProblemReporter
}

/**
 * @return languages serialized to the {@link LionWebJsonChunk serialization chunk} passed in the {@link LanguageDeserializationData data object}.
 */
export const deserializeLanguagesFrom = ({serializationChunk, dependentLanguages, problemReporter, lionWebVersion = defaultLionWebVersion}: LanguageDeserializationData): Language[] =>
    deserializerWith({
        writer: lioncoreWriterFor(lionWebVersion),
        languages: [lioncoreFacade.language, ...(dependentLanguages ?? [])],
        problemReporter: problemReporter ?? consoleProblemReporter
    })(
        serializationChunk,
        [lioncoreBuiltinsFacade.language, ...(dependentLanguages ?? [])].flatMap(nodesExtractorUsing(lioncoreReaderFor(defaultLionWebVersion))),
    )
        .filter((rootNode) => rootNode instanceof Language)
        .map((language) => (language as Language).dependingOn(...(dependentLanguages ?? [])))


/**
 * Deserializes languages that have been serialized into the LionWeb serialization JSON format
 * as an instance of the LionCore metametamodel, using {@link _M3Concept these type definitions}.
 */
export const deserializeLanguages = (serializationChunk: LionWebJsonChunk, ...dependentLanguages: Language[]): Language[] =>
    deserializeLanguagesFrom({ serializationChunk, dependentLanguages })


/**
 * Deserializes languages that have been serialized into the LionWeb serialization JSON format
 * as an instance of the LionCore metametamodel, using {@link _M3Concept these type definitions}.
 * This function takes a {@link ProblemReporter} to be able to see what problems occurred.
 *
 * @deprecated Use {@link deserializeLanguagesFrom} instead.
 */
export const deserializeLanguagesWithReporter = (
    serializationChunk: LionWebJsonChunk,
    problemReporter: ProblemReporter,
    ...dependentLanguages: Language[]
): Language[] =>
    deserializeLanguagesFrom({ serializationChunk, problemReporter, dependentLanguages })

/**
 * Legacy alias for {@link deserializeLanguagesWithReporter}, kept for backward compatibility, and to be deprecated and removed later.
 *
 * @deprecated Use {@link deserializeLanguagesFrom} instead.
 */
export const deserializeLanguagesWithHandler = deserializeLanguagesWithReporter

