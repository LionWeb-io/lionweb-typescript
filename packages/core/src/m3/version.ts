import { LionCoreBuiltinsFacade } from "./builtins-common.js"
import { lioncoreBuiltinsFacade } from "./builtins.js"
import { LionCoreFacade } from "./lioncore-common.js"
import { lioncoreFacade } from "./lioncore.js"


/**
 * The *current* release(d) version.
 *
 * @deprecated Use {@code defaultLionWebVersion.serializationFormatVersion} instead.
 */
export const currentReleaseVersion = "2023.1"


/**
 * Representation of a LionWeb version.
 */
export class LionWebVersion {
    constructor(
        /**
         * The value of the root-level `serializationFormatVersion` field for {@link LionWebJsonChunk serialization chunks} *emitted* by this version.
         */
        public readonly serializationFormatVersion: string,
        public readonly lioncoreFacade: LionCoreFacade,
        public readonly builtinsFacade: LionCoreBuiltinsFacade
    ) {}
}

/**
 * An enumeration (as const object) of all LionWeb versions currently supported by the WIP specification.
 */
export const LionWebVersions = {
    // LionWeb standard version 2023.1 — defined at https://lionweb.io/specification/2023.1
    v2023_1: new LionWebVersion("2023.1", lioncoreFacade, lioncoreBuiltinsFacade),

} as const


/**
 * The current default LionWeb version.
 */
export const defaultLionWebVersion = LionWebVersions.v2023_1

