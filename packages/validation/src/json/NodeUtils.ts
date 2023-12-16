import {
    LionWebJsonContainment,
    LionWebJsonNode,
    LionWebJsonProperty,
    LionWebJsonReference,
    LionWebJsonReferenceTarget,
} from "./LionWebJson.js"

/**
 * Utility functions for LionWebJsonNode's
 */
export class NodeUtils {
    /**
     * Find property with key equals `key` in `node`.
     * @param node
     * @param key
     */
    static findLwProperty(node: LionWebJsonNode, key: string): LionWebJsonProperty | null {
        for (const property of node.properties) {
            if (property.property.key === key) {
                return property
            }
        }
        return null
    }

    /**
     * Find containment child with key equals `key` in `node`.
     * @param node
     * @param key
     */
    static findLwChild(node: LionWebJsonNode, key: string): LionWebJsonContainment | null {
        for (const containment of node.containments) {
            if (containment.containment.key === key) {
                return containment
            }
        }
        return null
    }

    static findLwReference(node: LionWebJsonNode, key: string): LionWebJsonReference | null {
        for (const reference of node.references) {
            if (reference.reference.key === key) {
                return reference
            }
        }
        return null
    }

    static findLwReferenceTarget(
        lwReferenceTargets: LionWebJsonReferenceTarget[],
        target: LionWebJsonReferenceTarget,
    ): LionWebJsonReferenceTarget | null {
        for (const refTarget of lwReferenceTargets) {
            if (refTarget.reference === target.reference && refTarget.resolveInfo === target.resolveInfo) {
                return refTarget
            }
        }
        return null
    }

    /**
     * Get all nodes that are children for `node`: both the containment and annotaion children
     * @param node
     */
    static allChildren(node: LionWebJsonNode): string[] {
        const result: string[] = []
        for (const containment of node.containments) {
            result.push(...containment.children)
        }
        result.push(...node.annotations)
        return result
    }
}
