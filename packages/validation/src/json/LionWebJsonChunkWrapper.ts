import { LionWebJsonChunk, LionWebJsonNode, LionWebJsonProperty } from "./LionWebJson";
import { LionwebLanguageDefinition } from "./LionwebLanguageDefinition";
import { NodeUtils } from "./NodeUtils";

export type NodeId = string;

/**
 * Wraps around a LionWebJsonChunk, providing access to information inside, using caches to improve performance.
 */
export class LionWebJsonChunkWrapper {
    jsonChunk: LionWebJsonChunk;
    language: LionwebLanguageDefinition  | null = null;
    /**
     * Map to get quick access to nodes by id.
     * @protected
     */
    protected nodesIdMap: Map<NodeId, LionWebJsonNode> = new Map<NodeId, LionWebJsonNode>();

    constructor(chunk: unknown) {
        this.jsonChunk = chunk as LionWebJsonChunk;
        // this.prepareNodeIds();
    }

    /** Put all nodes in a map, validate that there are no two nodes with the same id.
     *  The check should logically be in LionWebReferenceValidator, but the created map is needed here.
     */
    prepareNodeIds() {
        this.nodesIdMap = new Map<NodeId, LionWebJsonNode>();
        this.jsonChunk.nodes.forEach((node) => {
            this.nodesIdMap.set(node.id, node);
        });
    }

    getMap(): Map<NodeId, LionWebJsonNode> {
        if (this.nodesIdMap === undefined) {
            this.prepareNodeIds();
        }
        return this.nodesIdMap;
    }

    getNode(id: string): LionWebJsonNode | undefined {
        return this.getMap().get(id);
    }

    findNodesOfConcept(conceptKey: string): LionWebJsonNode[] {
        const result: LionWebJsonNode[] = [];
        for (const node of this.jsonChunk.nodes) {
            if (node.concept.key === conceptKey) {
                result.push(node);
            }
        }
        return result;
        // return this.jsonChunk.nodes.filter(node => node.concept.key === conceptKey);
    }

    allProperties(conceptNode: LionWebJsonNode): LionWebJsonProperty[] {
        const result: LionWebJsonProperty[] = [];
        result.push(...conceptNode.properties);
        const extendsReference = NodeUtils.findLwReference(conceptNode, "Concept-extends");
        if (extendsReference !==null) {
            // extendsReference.targets.forEach(target => {
            //     // Find the extended concept
            //     if (this.language !== null) {
            //         // const targetNode = this.language.languageChunkWrapper.getNode(target.reference);
            //         // TODO etc., but need to cleanup LanguageDefinition first.
            //     }
            // });
        }
        return result;
    }

}


