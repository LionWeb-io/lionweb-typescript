import { LionWebId, LionWebJsonMetaPointer, LionWebJsonNode } from "../json/LionWebJson.js"
import { LionWebLanguageWrapper } from "./LionWebLanguageWrapper.js"
import { MetaPointerMap } from "./MetaPointerMap.js"

/**
 * Collection of language definitions
 */
export class CompositeLionWebLanguageWrapper extends LionWebLanguageWrapper {
    metaPointerMap: MetaPointerMap = new MetaPointerMap()
    languageMap = new Map<string, Map<string, LionWebLanguageWrapper>>()
    languages: LionWebLanguageWrapper[] = []

    addLanguage(lionWebLanguage: LionWebLanguageWrapper) {
        let language = this.languageMap.get(lionWebLanguage.key)
        if (language === undefined) {
            language = new Map<string, LionWebLanguageWrapper>()
            this.languageMap.set(lionWebLanguage.key, language)
        }
        const version = language.get(lionWebLanguage.version)
        if (version === undefined) {
            language.set(lionWebLanguage.version, lionWebLanguage)
        } else {
            console.error("Language already known")
            return
        }
        this.languages.push(lionWebLanguage)
        lionWebLanguage.jsonChunk.nodes.forEach(node => {
            this.metaPointerMap.add(lionWebLanguage.key, lionWebLanguage.version, node)
        })
    }

    getLanguage(pointer: LionWebJsonMetaPointer): LionWebLanguageWrapper | undefined {
        return this.languageMap.get(pointer.language)?.get(pointer.version)
    }

    /**
     * Gets the node with _metaPointer_ in any of the known languages
     * @param metaPointer
     */
    getNodeByMetaPointer(metaPointer: LionWebJsonMetaPointer): LionWebJsonNode | undefined {
        return this.metaPointerMap.get(metaPointer)
    }

    /**
     * Get node in any of the languages.
     * @param nodeId
     */
    getNode(nodeId: LionWebId) {
        for (const chunk of this.languages) {
            const node = chunk.getNode(nodeId)
            if (node !== undefined) {
                return node
            }
        }
        return undefined
    }
}
