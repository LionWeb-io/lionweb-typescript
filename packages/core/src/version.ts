import { lioncoreBuiltinsFacade, LionCoreBuiltinsFacade, lioncoreFacade } from "./m3/index.js"
import { LionCoreFacade } from "./m3/lioncore-common.js"


/**
 * The *current* release(d) version.
 */
export const currentReleaseVersion = "2023.1"


/**
 * Representation of a LionWeb version.
 */
export class LionWebVersion {
    constructor(
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

} as const;

