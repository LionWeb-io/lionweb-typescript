import { v2023_1 } from "./versions/v2023_1/version.js"
import { LionWebVersion } from "./version.js"


/**
 * The *current* release(d) version.
 *
 * @deprecated Use {@code defaultLionWebVersion.serializationFormatVersion} instead.
 */
export const currentReleaseVersion = "2023.1"


/**
 * An enumeration (as const object) of all LionWeb versions currently supported by the WIP specification.
 */
export const LionWebVersions = {
    // LionWeb standard version 2023.1 — defined at https://lionweb.io/specification/2023.1
    v2023_1
} as const

/**
 * All LionWeb versions.
 */
export const allLionWebVersions = Object.values(LionWebVersions)

/**
 * The current default LionWeb version.
 */
export const defaultLionWebVersion = LionWebVersions.v2023_1

/**
 * @return the {@link LionWebVersion} matching the given `serializationFormatVersion` string,
 * or {@link undefined} if there’s none.
 */
export const lionWebVersionFrom = (serializationFormatVersion: string): LionWebVersion | undefined =>
    allLionWebVersions.find((version) => version.serializationFormatVersion === serializationFormatVersion)

