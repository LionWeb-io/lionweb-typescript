/** The path of the metadata of a LionWeb Archive, matched case-insensitively (as LionWeb Java does). */
export const metadataPath = "metadata/metadata.properties"

/** The property, in the metadata of a LionWeb Archive, holding its LionWeb version. */
export const lionWebVersionKey = "LionWeb-Version"

/** @return the metadata of a LionWeb Archive with the given LionWeb version, in the Java properties format. */
export const metadataFor = (lionWebVersion: string): string => `${lionWebVersionKey}=${lionWebVersion}\n`

/**
 * @return the LionWeb version in the given metadata of a LionWeb Archive, or `undefined` if it has none.
 * This reads the subset of the Java properties format that LionWeb Java writes: a `key=value` (or `key: value`) line.
 */
export const lionWebVersionIn = (metadata: string): string | undefined =>
    metadata
        .split(/\r?\n/)
        .map(line => lionWebVersionLine.exec(line))
        .find(match => match !== null)?.[1]

const lionWebVersionLine = new RegExp(`^\\s*${lionWebVersionKey}\\s*[=:\\s]\\s*(.*?)\\s*$`)
