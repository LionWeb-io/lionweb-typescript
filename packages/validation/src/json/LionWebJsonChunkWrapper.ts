import {
    isEqualMetaPointer,
    LionWebId,
    LionWebJsonChunk,
    LionWebJsonContainment,
    LionWebJsonMetaPointer,
    LionWebJsonNode,
    LionWebJsonReference
} from "./LionWebJson.js"
import { MetaPointers } from "./M3definitions.js"
import { NodeUtils } from "./NodeUtils.js"

/**
 * Wraps around a LionWebJsonChunk, providing access to information inside, might be using caches to improve performance.
 * NB Make sure that the contents of the chunk are not changed after creating the wrapper!
 * NB BE aware that with `pushChunk(...)` the original chunk will be changed.
 */
export class LionWebJsonChunkWrapper {
    jsonChunk: LionWebJsonChunk
    /**
     * Map to get quick access to nodes by id.
     * @protected
     */
    protected nodesIdMap: Map<LionWebId, LionWebJsonNode> = new Map<LionWebId, LionWebJsonNode>()

    /**
     * Create a wrapper with `chunk` as its chunk
     * @param chunk
     */
    constructor(chunk: LionWebJsonChunk) {
        this.jsonChunk = chunk
        this.prepareNodeIds(chunk)
    }

    /** Put all nodes in a map, validate that there are no two nodes with the same id.
     *  The check should logically be in LionWebReferenceValidator, but the created map is needed here.
     */
    prepareNodeIds(chunk: LionWebJsonChunk) {
        chunk.nodes.forEach(node => {
            this.nodesIdMap.set(node.id, node)
        })
    }

    getNode(id: string): LionWebJsonNode | undefined {
        return this.nodesIdMap.get(id)
    }

    findNodesOfClassifier(concept: LionWebJsonMetaPointer): LionWebJsonNode[] {
        return this.jsonChunk.nodes.filter(node => isEqualMetaPointer(node.classifier, concept))
    }

    /**
     * Return the target nodes inside `reference` as a list of actual nodes (LionWebJsonNode[])
     * @param reference
     */
    getReferredNodes(reference: LionWebJsonReference | undefined) {
        if (reference === undefined) {
            return []
        }
        const result = reference.targets.flatMap(target => {
            if (target.reference === null) {
                return []
            } else {
                const referredNode = this.getNode(target.reference)
                return referredNode === undefined ? [] : [referredNode]
            }
        })
        return result
    }

    /**
     * Return the target nodes inside `reference` as a list of actual nodes (LionWebJsonNode[])
     * @param reference
     */
    getChildrenAsNodes(containment: LionWebJsonContainment | undefined) {
        if (containment === undefined) {
            return []
        }
        const result: LionWebJsonNode[] = []
        containment.children.forEach(ch => {
            const childNode = this.getNode(ch)
            if (childNode !== undefined) {
                result.push(childNode)
            }
        })
        return result
    }

    asString(): string {
        let result = ""
        const partitions = this.jsonChunk.nodes.filter(n => n.parent === null)
        partitions.forEach(partition => {
            const pString = this.recursiveToString(partition, 1)
            result += pString
        })
        return result
    }

    private recursiveToString(node: LionWebJsonNode | undefined, depth: number): string {
        if (node === undefined) {
            return ""
        }
        let result: string = ""
        const nameProperty = NodeUtils.findProperty(node, MetaPointers.INamedName)
        const name = nameProperty === undefined ? "" : " " + nameProperty.value
        result += this.indent(depth) + "(" + node.id + ")" + name + "\n"
        if (node.annotations !== undefined && node.annotations.length !== 0) {
            result += this.indent(depth + 1) + "*Annotations*" + "\n"
            node.annotations.forEach(ann => {
                result += this.recursiveToString(this.getNode(ann), depth + 1)
                // result += this.indent(depth) + "[[" + JSON.stringify(ann) + "]]\n"
            })
        }
        node.properties
            .filter(p => p !== nameProperty)
            .forEach(property => {
                result += this.indent(depth + 1) + "*property* " + property.property.key + ": " + property.value + "\n"
            })
        node.references.forEach(ref => {
            result += this.indent(depth + 1) + "*" + ref.reference.key + "*: " + JSON.stringify(ref.targets) + "\n"
        })
        node.containments.forEach(cont => {
            if (cont.children.length !== 0) {
                result += this.indent(depth + 1) + "*" + cont.containment.key + "*" + "\n"
                cont.children.forEach(ch => {
                    result += this.recursiveToString(this.getNode(ch), depth + 1)
                })
            }
        })
        return result
    }

    private indent(depth: number): string {
        return Array(depth).join("    ")
    }
}
