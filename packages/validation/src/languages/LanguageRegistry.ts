import { LionWebId, LionWebJsonMetaPointer, LionWebJsonNode } from "@lionweb/json"
import { CompositeLionWebLanguageWrapper } from "./CompositeLionWebLanguageWrapper.js"
import { LionWebLanguageWrapper } from "./LionWebLanguageWrapper.js"

/**
 * Collection of language definitions
 */
export class LanguageRegistry {
    languages: CompositeLionWebLanguageWrapper = new CompositeLionWebLanguageWrapper({nodes: [], languages: [], serializationFormatVersion: "2023.1"})
    
    addLanguage(lionWebLanguage: LionWebLanguageWrapper) {
        // console.log("LanguageRegistry.add: " + lionWebLanguage.name + "  " + lionWebLanguage.jsonChunk.nodes.length)

        this.languages.addLanguage(lionWebLanguage)
    }
    
    clear(): void {
        this.languages = new CompositeLionWebLanguageWrapper({nodes: [], languages: [], serializationFormatVersion: "2023.1"})
    }

    getLanguage(pointer: LionWebJsonMetaPointer): LionWebLanguageWrapper | undefined {
        return this.languages.languageMap.get(pointer.language)?.get(pointer.version)
    }

    /**
     * Gets the node with _metaPointer_ in any of the known languages
     * @param metaPointer
     */
    getNodeByMetaPointer(metaPointer: LionWebJsonMetaPointer): LionWebJsonNode | undefined {
        return this.languages.getNodeByMetaPointer(metaPointer)
    }

    findNode(nodeId: LionWebId | undefined | null) {
        if (nodeId === undefined || nodeId === null ) {
            return undefined
        }
        for (const chunk of this.languages.languages) {
            const node = chunk.getNode(nodeId)
            if (node !== undefined) {
                return node
            }
        }
        return undefined
    }
}

// export const KnownLanguages = new LanguageRegistry()
