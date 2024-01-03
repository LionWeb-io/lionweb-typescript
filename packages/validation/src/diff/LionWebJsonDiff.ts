import { JsonContext } from "../issues/index.js"
import {
    ChunkUtils,
    isEqualMetaPointer,
    LionWebJsonChunk,
    LionWebJsonContainment,
    LionWebJsonNode,
    LionWebJsonProperty,
    LionWebJsonReference,
    LionWebJsonReferenceTarget,
    LwJsonUsedLanguage,
    NodeUtils
} from "../json/index.js"
import { Change, GenericChange, Missing } from "./changes/Change.js"
import { LanguageAdded, LanguageRemoved, NodeAdded, NodeRemoved, SerializationFormatChange } from "./changes/ChunkChange.js"
import { ChildAdded, ChildRemoved } from "./changes/ContainmentChange.js"
import { AnnotationAdded, AnnotationRemoved, TargetAdded, TargetRemoved } from "./changes/index.js"
import { NodeClassifierChanged, ParentChanged } from "./changes/NodeChange.js"
import { PropertyValueChanged } from "./changes/PropertyChange.js"
import { DiffResult } from "./DiffResult.js"

/**
 * Comparing LionWeb JSON chunks and find all differences
 */
export class LionWebJsonDiff {
    diffResult = new DiffResult()

    constructor() {}

    change(change: Change): void {
        this.diffResult.change(change)
    }

    diff(ctx: JsonContext, msg: string) {
        const change = new GenericChange(ctx, msg)
        this.diffResult.change(change)
    }

    /**
     * Compare two LwNode objects and return their difference
     * @param beforeNode
     * @param afterNode
     */
    diffLwNode(ctx: JsonContext, beforeNode: LionWebJsonNode, afterNode: LionWebJsonNode): void {
        if (!isEqualMetaPointer(beforeNode.classifier, afterNode.classifier)) {
            this.change(new NodeClassifierChanged(ctx.concat("classifier"), beforeNode, beforeNode.classifier, afterNode.classifier))
        }
        if (beforeNode.parent !== afterNode.parent) {
            this.change(new ParentChanged(ctx, beforeNode, beforeNode.parent, afterNode.parent))
        }
        // Find diff between previous and next properties
        beforeNode.properties.forEach((beforeProperty: LionWebJsonProperty, index: number) => {
            const key = beforeProperty.property.key
            const afterProperty = NodeUtils.findLwProperty(afterNode, key)
            if (afterProperty === null) {
                this.change(
                    new PropertyValueChanged(
                        ctx.concat("properties", index),
                        beforeNode.id,
                        beforeProperty.property,
                        beforeProperty.value,
                        null,
                        Missing.MissingAfter
                    ),
                )
            } else {
                this.diffLwProperty(ctx.concat("properties", index), beforeNode, beforeProperty, afterProperty)
            }
        })
        afterNode.properties.forEach((afterProperty: LionWebJsonProperty, index: number) => {
            const key = afterProperty.property.key
            const beforeProperty = NodeUtils.findLwProperty(beforeNode, key)
            if (beforeProperty === null) {
                this.change(
                    new PropertyValueChanged(
                        ctx.concat("properties", index),
                        beforeNode.id,
                        afterProperty.property,
                        null,
                        afterProperty.value,
                        Missing.MissingBefore
                    ),
                )
            }
            // no else, if the property exists in both nodes, the diff has been claculated in the loop before this one
        })
        beforeNode.containments.forEach((beforeContainment: LionWebJsonContainment, index: number) => {
            const beforeKey = beforeContainment.containment.key
            const afterContainment = NodeUtils.findLwChild(afterNode, beforeKey)
            if (afterContainment === null) {
                // NB No containment is considered equivalent to a containment with empty _children_
                if (beforeContainment.children.length !== 0) {
                    beforeContainment.children.forEach(childId => {
                        this.change(new ChildRemoved(ctx.concat("containments", index), beforeNode, beforeContainment.containment, childId, Missing.MissingAfter))
                    })
                }
            } else {
                this.diffContainment(ctx.concat("containments", index), beforeNode, beforeContainment, afterContainment)
            }
        })
        afterNode.containments.forEach((afterContainment: LionWebJsonContainment, index: number) => {
            const afterKey = afterContainment.containment.key
            const beforeContainment = NodeUtils.findLwChild(beforeNode, afterKey)
            if (beforeContainment === null) {
                if (afterContainment.children.length !== 0) {
                    afterContainment.children.forEach(childId => {
                        this.change(new ChildAdded(ctx.concat("containments", index), afterNode, afterContainment.containment, childId, Missing.MissingBefore))
                    })
                }
            }
            // No else, has already been done
        })
        beforeNode.references.forEach((beforeReference: LionWebJsonReference, index: number) => {
            const key = beforeReference.reference.key
            const afterReference = NodeUtils.findLwReference(afterNode, key)
            if (afterReference === null) {
                if (beforeReference.targets.length !== 0) {
                    beforeReference.targets.forEach(target => {
                        this.change(new TargetRemoved(ctx.concat("references", index), afterNode, beforeReference, afterReference, target, Missing.MissingAfter))
                    })
                }
            } else {
                this.diffLwReference(ctx.concat("references", index), beforeNode, beforeReference, afterReference)
            }
        })
        afterNode.references.forEach((afterReference: LionWebJsonReference, index: number) => {
            const afterKey = afterReference.reference.key
            const beforeReference = NodeUtils.findLwReference(afterNode, afterKey)
            if (beforeReference === null) {
                if (afterReference.targets.length !== 0) {
                    afterReference.targets.forEach(target => {
                        this.change(new TargetAdded(ctx.concat("references", index), afterNode, beforeReference, afterReference, target, Missing.MissingBefore))
                    })
                }
            }
        })
        if (beforeNode.annotations !== undefined && afterNode.annotations !== undefined) {
            beforeNode.annotations.forEach((beforeAnn: string, index: number) => {
                if (!afterNode.annotations.includes(beforeAnn)) {
                    this.change(new AnnotationRemoved(ctx, beforeNode, afterNode, beforeAnn, index))
                }
            })
            afterNode.annotations.forEach((afterAnn: string, index: number) => {
                if (!beforeNode.annotations.includes(afterAnn)) {
                    this.change(new AnnotationAdded(ctx, beforeNode, afterNode, afterAnn, index))
                }
            })
        }
    }

    diffLwChunk(beforeChunk: LionWebJsonChunk, afterChunk: LionWebJsonChunk): void {
        const ctx = new JsonContext(null, ["$"])
        console.log("Comparing chunks")
        if (beforeChunk.serializationFormatVersion !== afterChunk.serializationFormatVersion) {
            this.change(
                new SerializationFormatChange(
                    ctx.concat("serializationFormatVersion"),
                    beforeChunk.serializationFormatVersion,
                    afterChunk.serializationFormatVersion,
                ),
            )
        }
        beforeChunk.languages.forEach((beforeLanguage: LwJsonUsedLanguage, index: number) => {
            const afterLanguage = ChunkUtils.findLwUsedLanguage(afterChunk, beforeLanguage.key)
            if (afterLanguage === null) {
                this.change(new LanguageRemoved(ctx.concat("languages", index), beforeLanguage))
            } else {
                this.diffLwUsedLanguage(ctx.concat("languages", index), beforeLanguage, afterLanguage)
            }
        })
        afterChunk.languages.forEach((afterLanguage: LwJsonUsedLanguage, index: number) => {
            const beforeLanguage = ChunkUtils.findLwUsedLanguage(beforeChunk, afterLanguage.key)
            if (beforeLanguage === null) {
                this.change(new LanguageAdded(ctx.concat("languages", index), afterLanguage))
            }
        })
        beforeChunk.nodes.forEach((beforeNode: LionWebJsonNode, index: number) => {
            const beforeId = beforeNode.id
            const afterNode = ChunkUtils.findNode(afterChunk, beforeId)
            const newCtx = ctx.concat("nodes", index)
            if (afterNode === null || afterNode === undefined) {
                this.change(new NodeRemoved(ctx, beforeNode))
            } else {
                this.diffLwNode(newCtx, beforeNode, afterNode)
            }
        })
        afterChunk.nodes.forEach((afterNode: LionWebJsonNode, index: number) => {
            const afterId = afterNode.id
            const beforeNode = ChunkUtils.findNode(beforeChunk, afterId)
            if (beforeNode === null) {
                this.change(new NodeAdded(ctx.concat("nodes", index), afterNode))
            }
        })
    }

    diffContainment(
        ctx: JsonContext,
        node: LionWebJsonNode,
        beforeContainment: LionWebJsonContainment,
        afterContainment: LionWebJsonContainment,
    ): void {
        if (!isEqualMetaPointer(beforeContainment.containment, afterContainment.containment)) {
            console.error("diffContainment: MetaPointers of containments should be identical")
            this.diff(
                ctx,
                `Containment Object has concept ${JSON.stringify(beforeContainment.containment)} vs ${JSON.stringify(
                    afterContainment.containment,
                )}`,
            )
        }
        // Check whether children exist in both objects (two for loops)
        // TODO Also check for the order that can be changed!!!
        for (const childId1 of beforeContainment.children) {
            if (!afterContainment.children.includes(childId1)) {
                this.change(new ChildRemoved(ctx, node, beforeContainment.containment, childId1))
            }
        }
        for (const childId2 of afterContainment.children) {
            if (!beforeContainment.children.includes(childId2)) {
                this.change(new ChildAdded(ctx, node, beforeContainment.containment, childId2))
            }
        }
    }

    diffLwReference(ctx: JsonContext, node: LionWebJsonNode, beforeRef: LionWebJsonReference, afterRef: LionWebJsonReference): void {
        if (!isEqualMetaPointer(beforeRef.reference, afterRef.reference)) {
            console.error("diffContainment: MetaPointers of containments should be identical")
            this.diff(ctx, `Reference has concept ${JSON.stringify(beforeRef.reference)} vs ${JSON.stringify(afterRef.reference)}`)
        }
        beforeRef.targets.forEach((beforeTarget: LionWebJsonReferenceTarget, index: number) => {
            const afterTarget = NodeUtils.findLwReferenceTarget(afterRef.targets, beforeTarget)
            if (afterTarget === null) {
                this.change(new TargetRemoved(ctx.concat("targets", index), node, beforeRef, afterRef, beforeTarget))
            } else {
                if (beforeTarget.reference !== afterTarget.reference || beforeTarget.resolveInfo !== afterTarget.resolveInfo) {
                    this.diff(
                        ctx.concat("targets", index),
                        `REFERENCE target ${JSON.stringify(beforeTarget)} vs ${JSON.stringify(afterTarget)}`,
                    )
                }
            }
        })
        afterRef.targets.forEach((afterTarget: LionWebJsonReferenceTarget, index: number) => {
            const beforeTarget = NodeUtils.findLwReferenceTarget(beforeRef.targets, afterTarget)
            if (beforeTarget === null) {
                this.change(new TargetAdded(ctx.concat("targets", index), node, beforeRef, afterRef, afterTarget))
            } else {
                if (beforeTarget.reference !== afterTarget.reference || beforeTarget.resolveInfo !== afterTarget.resolveInfo) {
                    this.diff(
                        ctx.concat("targets", index),
                        `REFERENCE target ${JSON.stringify(beforeTarget)} vs ${JSON.stringify(afterTarget)}`,
                    )
                }
            }
        })
        for (const target of afterRef.targets) {
            if (NodeUtils.findLwReferenceTarget(beforeRef.targets, target) === null) {
                this.diff(ctx, `REFERENCE Target ${JSON.stringify(target)} missing in first `)
            }
        }
    }

    private diffLwUsedLanguage(ctx: JsonContext, obj1: LwJsonUsedLanguage, obj2: LwJsonUsedLanguage) {
        if (obj1.key !== obj2.key || obj1.version !== obj2.version) {
            this.diff(ctx, `Different used languages ${JSON.stringify(obj1)} vs ${JSON.stringify(obj2)}`)
        }
    }

    private diffLwProperty(
        ctx: JsonContext,
        node: LionWebJsonNode,
        beforeProperty: LionWebJsonProperty,
        afterProperty: LionWebJsonProperty,
    ) {
        if (!isEqualMetaPointer(beforeProperty.property, afterProperty.property)) {
            console.error("diffContainment: MetaPointers of containments should be identical")
            this.diff(
                ctx,
                `Property Object has concept ${JSON.stringify(beforeProperty.property)} vs ${JSON.stringify(afterProperty.property)}`,
            )
        }
        if (beforeProperty.value !== afterProperty.value) {
            this.change(new PropertyValueChanged(ctx, node.id, beforeProperty.property, beforeProperty.value, afterProperty.value))
        }
    }
}
