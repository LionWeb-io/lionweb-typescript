import { LionWebJsonChunk } from "@lionweb/json"
import { deserializerWith } from "../deserializer.js"
import { nodesExtractorUsing } from "../extraction.js"
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    consoleProblemReporter,
    ProblemReporter
} from "../reporter.js"
import { lioncoreReaderFor, lioncoreWriterFor } from "./reading-writing.js"
import { Language } from "./types.js"
import { LionWebVersion } from "./version.js"
import { LionWebVersions } from "./versions.js"


/**
 * Type def. for objects that contain all necessary data to deserialize one or more languages from a {@link LionWebJsonChunk serialization chunk}.
 */
export type LanguageDeserializationData = {
    serializationChunk: LionWebJsonChunk
    /**
     * The version of the LionWeb serialization format to deserialize from.
     * Default: {@link LionWebVersions.v2023_1}.
     */
    lionWebVersion?: LionWebVersion
    dependentLanguages?: Language[]
    /**
     * A {@link ProblemReporter} to report problems with.
     * Default: {@link consoleProblemReporter}.
     */
    problemReporter?: ProblemReporter
}

/**
 * @return languages serialized to the {@link LionWebJsonChunk serialization chunk} passed in the {@link LanguageDeserializationData data object}.
 */
export const deserializeLanguagesFrom = ({ serializationChunk, dependentLanguages, problemReporter, lionWebVersion = LionWebVersions.v2023_1 }: LanguageDeserializationData): Language[] =>
    deserializerWith({
        lionWebVersion,
        writer: lioncoreWriterFor(lionWebVersion),
        languages: [lionWebVersion.lioncoreFacade.language, ...(dependentLanguages ?? [])],
        problemReporter
    })(
        serializationChunk,
        [lionWebVersion.builtinsFacade.language, ...(dependentLanguages ?? [])].flatMap(nodesExtractorUsing(lioncoreReaderFor(lionWebVersion))),
    )
        .filter((rootNode) => rootNode instanceof Language)
        .map((language) => (language as Language).dependingOn(...(dependentLanguages ?? [])))

