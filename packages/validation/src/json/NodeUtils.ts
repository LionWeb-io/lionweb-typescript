import {
    isEqualMetaPointer,
    isEqualReferenceTarget,
    LionWebJsonContainment, LionWebJsonMetaPointer,
    LionWebJsonNode,
    LionWebJsonProperty,
    LionWebJsonReference,
    LionWebJsonReferenceTarget
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
    static findProperty(node: LionWebJsonNode, property: LionWebJsonMetaPointer): LionWebJsonProperty | undefined {
        if (node === undefined) {
            return undefined
        }
        return node.properties.find(
            prop => isEqualMetaPointer(prop.property, property)
        )
    }

    /**
     * Find property with key equals `key` in `node`.
     * @param node
     * @param key
     */
    static findPropertyValue(node: LionWebJsonNode, property: LionWebJsonMetaPointer): string | undefined {
        const propertyJson = NodeUtils.findProperty(node, property)
        if (propertyJson === undefined) {
            return undefined
        } else {
            return propertyJson.value
        }
    }

    // /**
    //  * Find property with key equals `key` in `node`.
    //  * @param node
    //  * @param key
    //  */
    // static findPropertyInList(property: LionWebJsonProperty, propertiesDefinitions: LionWebJsonNode[]): LionWebJsonProperty | undefined {
    //     return propertiesDefinitions.find( prop => {
    //        
    //         isEqualMetaPointer(prop.classifier, metaPointer)
    //
    //     })
    // }

    /**
     * Find containment child with key equals `key` in `node`.
     * @param node
     * @param key
     */
    static findChild(node: LionWebJsonNode, key: string): LionWebJsonContainment | undefined {
        if (node === undefined) {
            return undefined
        }
        for (const containment of node.containments) {
            if (containment.containment.key === key) {
                return containment
            }
        }
        return undefined
    }

    static findContainment(node: LionWebJsonNode, containment: LionWebJsonMetaPointer): LionWebJsonContainment | undefined {
        if (node === undefined) {
            return undefined
        }
        return node.containments.find(cont => isEqualMetaPointer(cont.containment, containment))
    }

    static findReference(node: LionWebJsonNode, reference: LionWebJsonMetaPointer): LionWebJsonReference | undefined {
        if (node === undefined) {
            return undefined
        }
        return node.references.find(ref => isEqualMetaPointer(ref.reference, reference))
    }

    static findReferenceTarget(
        referenceTargets: LionWebJsonReferenceTarget[],
        target: LionWebJsonReferenceTarget,
    ): LionWebJsonReferenceTarget | undefined {
        for (const refTarget of referenceTargets) {
            if (isEqualReferenceTarget(refTarget, target)) {
                return refTarget
            }
        }
        return undefined
    }
    
    static findContainmentContainingChild(containments: LionWebJsonContainment[], childId: string): LionWebJsonContainment | undefined {
        return containments.find(cont => cont.children.includes(childId))
    }
}
