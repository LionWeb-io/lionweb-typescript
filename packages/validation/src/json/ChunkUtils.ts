import { LionWebJsonChunk, LionWebJsonNode, LionWebJsonUsedLanguage } from "@lionweb/json"

/**
 * Utility functions for LionWeb chunks
 */
export class ChunkUtils {
    /**
     * Find a used language in `chunk` with `key`.
     * @param chunk
     * @param key
     */
    static findLwUsedLanguage(chunk: LionWebJsonChunk, key: string): LionWebJsonUsedLanguage | null {
        for (const language of chunk.languages) {
            if (language.key === key) {
                return language
            }
        }
        return null
    }

    /**
     * Find a used language in `chunk` with `key` and 'version'.
     * @param chunk
     * @param key
     * @param version
     */
    static findLwUsedLanguageWithVersion(chunk: LionWebJsonChunk, key: string, version: string): LionWebJsonUsedLanguage | null {
        for (const language of chunk.languages) {
            if (language.key === key && language.version === version) {
                return language
            }
        }
        return null
    }

    /**
     * Find node with id equals `id` in `chunk`.
     * @param chunk
     * @param id
     */
    static findNode(chunk: LionWebJsonChunk, id: string): LionWebJsonNode | null {
        for (const node of chunk.nodes) {
            if (node.id === id) {
                return node
            }
        }
        return null
    }
}
