import {
    LIONWEB_M3_INAMED_PROPERTY,
    LionWebId,
    LionWebJsonChunk,
    LionWebJsonNode,
    LionWebJsonProperty
} from "./LionWebJson.js"
import { LionWebLanguageDefinition } from "./LionWebLanguageDefinition.js"
import { NodeUtils } from "./NodeUtils.js"

/**
 * Wraps around a LionWebJsonChunk, providing access to information inside, using caches to improve performance.
 * NB Make sure that the contents of the chunk are not changed after creating the wrapper!
 */
export class LionWebJsonChunkWrapper {
    jsonChunk: LionWebJsonChunk
    language: LionWebLanguageDefinition | null = null
    /**
     * Map to get quick access to nodes by id.
     * @protected
     */
    protected nodesIdMap: Map<LionWebId, LionWebJsonNode> = new Map<LionWebId, LionWebJsonNode>()

    constructor(chunk: unknown) {
        this.jsonChunk = chunk as LionWebJsonChunk
        this.prepareNodeIds()
    }

    /** Put all nodes in a map, validate that there are no two nodes with the same id.
     *  The check should logically be in LionWebReferenceValidator, but the created map is needed here.
     */
    prepareNodeIds() {
        this.jsonChunk.nodes.forEach(node => {
            this.nodesIdMap.set(node.id, node)
        })
    }

    getNode(id: string): LionWebJsonNode | undefined {
        return this.nodesIdMap.get(id)
    }

    findNodesOfConcept(conceptKey: string): LionWebJsonNode[] {
        return this.jsonChunk.nodes.filter(node => node.classifier.key === conceptKey)
    }

    allProperties(conceptNode: LionWebJsonNode): LionWebJsonProperty[] {
        const result: LionWebJsonProperty[] = []
        result.push(...conceptNode.properties)
        const extendsReference = NodeUtils.findLwReference(conceptNode, "Concept-extends")
        if (extendsReference !== null) {
            // extendsReference.targets.forEach(target => {
            //     // Find the extended concept
            //     if (this.language !== null) {
            //         // const targetNode = this.language.languageChunkWrapper.getNode(target.reference);
            //         // TODO etc., but need to cleanup LanguageDefinition first.
            //     }
            // });
        }
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
            return "";
        }
        let result: string = ""
        const nameProperty = NodeUtils.findProperty(node, LIONWEB_M3_INAMED_PROPERTY)
        const name = nameProperty === undefined ? "" : " " + nameProperty.value
        result += this.indent(depth) + "(" + node.id + ")" + name + "\n"
        if (node.annotations !== undefined && node.annotations.length !== 0) {
            result += this.indent(depth + 1) + "*Annotations*" + "\n"
            node.annotations.forEach(ann => {
                result += this.recursiveToString(this.getNode(ann), depth + 1)
                // result += this.indent(depth) + "[[" + JSON.stringify(ann) + "]]\n"
            })
        }
        node.properties.filter(p => p !== nameProperty).forEach(property => {
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
