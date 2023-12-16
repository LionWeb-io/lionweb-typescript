import {
    LionWebId,
    LionWebJsonChunk,
    LionWebJsonContainment,
    LionWebJsonMetaPointer,
    LionWebJsonNode,
    LionWebJsonProperty,
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

    findContainment(node: LionWebJsonNode, containment: LionWebJsonMetaPointer): LionWebJsonContainment | undefined {
        return node.containments.find(
            cont =>
                cont.containment.key === containment.key &&
                cont.containment.language === containment.language &&
                cont.containment.version === containment.version,
        )
    }

    findProperty(node: LionWebJsonNode, property: LionWebJsonMetaPointer): LionWebJsonProperty | undefined {
        return node.properties.find(
            prop =>
                prop.property.key === property.key &&
                prop.property.language === property.language &&
                prop.property.version === property.version,
        )
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
        const nameProperty = this.findProperty(node, {
            language: "-default-key-LionCore_builtins",
            version: "2023.1",
            key: "-default-key-INamed-name",
        })
        const name = nameProperty === undefined ? "" : " " + nameProperty.value
        result += Array(depth).join("    ") + "(" + node.id + ")" + name + "\n"
        node.containments.forEach(cont => {
            if (cont.children.length !== 0) {
                result += Array(depth + 1).join("    ") + "*" + cont.containment.key + "*" + "\n"
                cont.children.forEach(ch => {
                    result += this.recursiveToString(this.getNode(ch), depth + 1)
                })
            }
        })
        return result
    }
}
