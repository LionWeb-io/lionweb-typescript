import {
    LionWebJsonChild,
    LionWebJsonNode,
    LionWebJsonProperty,
    LionWebJsonReference,
    LionWebJsonReferenceTarget
} from "./LionWebJson";

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
                return property;
            }
        }
        return null;
    }

    /**
     * Find containment child with key equals `key` in `node`.
     * @param node
     * @param key
     */
    static findLwChild(node: LionWebJsonNode, key: string): LionWebJsonChild | null {
        for (const lwChild of node.children) {
            if (lwChild.containment.key === key) {
                return lwChild;
            }
        }
        return null;
    }

    static findLwReference(node: LionWebJsonNode, key: string): LionWebJsonReference | null {
        for (const ref of node.references) {
            if (ref.reference.key === key) {
                return ref;
            }
        }
        return null;
    }

    static findLwReferenceTarget(lwReferenceTargets: LionWebJsonReferenceTarget[], target: LionWebJsonReferenceTarget): LionWebJsonReferenceTarget | null {
        for (const refTarget of lwReferenceTargets) {
            if (refTarget.reference === target.reference && refTarget.resolveInfo === target.resolveInfo) {
                return refTarget;
            }
        }
        return null;
    }

    /**
     * Get all nodes that are children for `node`: both the containment and annotaion children
     * @param node
     */
    static allChildren(node: LionWebJsonNode): string[] {
        const result: string[] = [];
        for (const children of node.children) {
            result.push(...children.children);
        }
        result.push(...node.annotations);
        return result;
    }

}
