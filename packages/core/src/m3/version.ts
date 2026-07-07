import { LionCoreBuiltinsFacade } from "./builtins-common.js"
import { nodesExtractorUsing } from "../extraction.js"
import { LionCoreFacade } from "./lioncore-common.js"
import { lioncoreReaderFor } from "./reading-writing.js"
import { Language, M3Node } from "./types.js"

/**
 * Representation of a LionWeb version.
 */
export class LionWebVersion {
    private readonly resolveMap = new Map<string, M3Node>()
    constructor(
        /**
         * The value of the root-level `serializationFormatVersion` field for {@link LionWebJsonChunk serialization chunks} *emitted* by this version.
         */
        public readonly serializationFormatVersion: string,
        public readonly lioncoreFacade: LionCoreFacade,
        public readonly builtinsFacade: LionCoreBuiltinsFacade
    ) {
        if (serializationFormatVersion === "2023.1") {
            return
        }
        const localQualifiedNameFragments = ({ parent, name }: M3Node): string[] =>
            parent === undefined ? [ name ] : [ ...localQualifiedNameFragments(parent), name ]
        const addAllToResolveMap = (language: Language) => {
            for (const node of nodesExtractorUsing(lioncoreReaderFor(this))(language)) {
                const resolveInfo = [ "LionWeb", ...localQualifiedNameFragments(node) ].join(".")
                this.resolveMap.set(resolveInfo, node)
            }
        }
        addAllToResolveMap(lioncoreFacade.language)
        addAllToResolveMap(builtinsFacade.language)
    }
    lookUpBuiltinLionCoreNodeBy = (resolveInfo: string): M3Node | undefined =>
        this.resolveMap.get(resolveInfo)
}

/*
 * This class must be in a separate file to avoid circular initializations:
 *  versions.ts[LionWebVersions] -> version-<version>.ts -> version.ts
 */

