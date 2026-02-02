import { v2023_1 } from "./version-2023_1.js"


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

