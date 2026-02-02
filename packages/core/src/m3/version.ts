import { LionCoreFacade } from "./lioncore-common.js"
import { LionCoreBuiltinsFacade } from "./builtins-common.js"

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
    ) {
    }
}

/*
 * This class must be in a separate file to avoid circular initializations:
 *  versions.ts[LionWebVersions] -> version-<version>.ts -> version.ts
 */

