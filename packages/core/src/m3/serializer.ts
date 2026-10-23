import { LionWebJsonChunk } from "@lionweb/json"
import { serializerWith } from "../serializer.js"
import { lioncoreReaderFor } from "./reading-writing.js"
import { ProblemReporter } from "../reporter.js"
import { Language } from "./types.js"
import { LionWebVersion } from "./version.js"
import { LionWebVersions } from "./versions.js"


/**
 * Type def. for objects that contain all necessary data to deserialize one or more languages from a {@link LionWebJsonChunk serialization chunk}.
 */
export type LanguageSerializationData = {
    /**
     * The version of the LionWeb serialization format to serialize to.
     * Default: {@link LionWebVersions.v2023_1}.
     */
    lionWebVersion?: LionWebVersion
    languages: Language[]
    /**
     * A {@link ProblemReporter} to report problems with.
     * Default: {@link consoleProblemReporter}.
     */
    problemReporter?: ProblemReporter
}

/**
 * @return the {@link LionWebJsonChunk serialization chunk} serializing the given languages (M2s, as instances of the LionCore M3),
 * according to the configured {@link LionWebVersion} (which itself defaults to {@link LionWebVersions.v2023_1}).
 */
export const serializeLanguagesFor = ({ languages, problemReporter, lionWebVersion = LionWebVersions.v2023_1 }: LanguageSerializationData): LionWebJsonChunk =>
    serializerWith({
        reader: lioncoreReaderFor(lionWebVersion),
        lionWebVersion,
        problemReporter
    })(languages)

