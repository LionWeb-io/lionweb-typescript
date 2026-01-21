import {
    builtinPropertyValueDeserializer,
    builtinPropertyValueSerializer,
    Language,
    lioncore,
    lioncoreBuiltins
} from "./m3/index.js"
import { PropertyValueDeserializer } from "./deserializer.js"
import { PropertyValueSerializer } from "./serializer.js"


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
        public readonly lionCore: Language,
        public readonly builtins: Language,
        public readonly builtinPropertyValueDeserializer: PropertyValueDeserializer,
        public readonly builtinPropertyValueSerializer: PropertyValueSerializer
    ) {}
}

/**
 * An enumeration (as const object) of all LionWeb versions currently supported by the WIP specification.
 */
export const LionWebVersions = {
    // LionWeb standard version 2023.1 — defined at https://lionweb.io/specification/2023.1
    v2023_1: new LionWebVersion("2023.1", lioncore, lioncoreBuiltins, builtinPropertyValueDeserializer, builtinPropertyValueSerializer),

} as const;

