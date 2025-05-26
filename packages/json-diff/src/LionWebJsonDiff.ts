import {
    isEqualMetaPointer,
    isEqualReferenceTarget,
    LionWebJsonChunk,
    LionWebJsonContainment,
    LionWebJsonNode,
    LionWebJsonProperty,
    LionWebJsonReference,
    LionWebJsonReferenceTarget,
    LionWebJsonUsedLanguage
} from "@lionweb/json"
import { ChunkUtils, JsonContext, NodeUtils } from "@lionweb/json-utils"
import { Change, GenericChange, Missing } from "./changes/Change.js"
import { LanguageAdded, LanguageRemoved, NodeAdded, NodeRemoved, SerializationFormatChange } from "./changes/ChunkChange.js"
import { ChildAdded, ChildOrderChanged, ChildRemoved } from "./changes/ContainmentChange.js"
import { AnnotationAdded, AnnotationOrderChanged, AnnotationRemoved, TargetAdded, TargetOrderChanged, TargetRemoved } from "./changes/index.js"
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
            const afterProperty = NodeUtils.findProperty(afterNode, beforeProperty.property)
            if (afterProperty === undefined) {
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
            const beforeProperty = NodeUtils.findProperty(beforeNode, afterProperty.property)
            if (beforeProperty === undefined) {
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
            const afterContainment = NodeUtils.findChild(afterNode, beforeKey)
            if (afterContainment === undefined) {
                // NB No containment is considered equivalent to a containment with empty _children_
                if (beforeContainment.children.length !== 0) {
                    beforeContainment.children.forEach(childId => {
                        this.change(new ChildRemoved(ctx.concat("containments", index), beforeNode, beforeContainment.containment, afterContainment, childId, Missing.MissingAfter))
                    })
                }
            } else {
                this.diffContainment(ctx.concat("containments", index), beforeNode, beforeContainment, afterContainment)
            }
        })
        afterNode.containments.forEach((afterContainment: LionWebJsonContainment, index: number) => {
            const afterKey = afterContainment.containment.key
            const beforeContainment = NodeUtils.findChild(beforeNode, afterKey)
            if (beforeContainment === undefined) {
                if (afterContainment.children.length !== 0) {
                    afterContainment.children.forEach(childId => {
                        this.change(new ChildAdded(ctx.concat("containments", index), afterNode, afterContainment.containment, afterContainment, childId, Missing.MissingBefore))
                    })
                }
            }
            // No else, has already been done
        })
        beforeNode.references.forEach((beforeReference: LionWebJsonReference, index: number) => {
            const afterReference = NodeUtils.findReference(afterNode, beforeReference.reference)
            if (afterReference === undefined) {
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
            const beforeReference = NodeUtils.findReference(afterNode, afterReference.reference)
            if (beforeReference === undefined) {
                if (afterReference.targets.length !== 0) {
                    afterReference.targets.forEach(target => {
                        this.change(new TargetAdded(ctx.concat("references", index), afterNode, beforeReference, afterReference, target, Missing.MissingBefore))
                    })
                }
            }
        })
        if (beforeNode.annotations !== undefined && afterNode.annotations !== undefined) {
            let annotationDiffFound = false
            beforeNode.annotations.forEach((beforeAnn: string, index: number) => {
                if (!afterNode.annotations.includes(beforeAnn)) {
                    annotationDiffFound = true
                    this.change(new AnnotationRemoved(ctx, beforeNode, afterNode, beforeAnn, index))
                }
            })
            afterNode.annotations.forEach((afterAnn: string, index: number) => {
                if (!beforeNode.annotations.includes(afterAnn)) {
                    annotationDiffFound = true
                    this.change(new AnnotationAdded(ctx, beforeNode, afterNode, afterAnn, index))
                }
            })
            if (!annotationDiffFound) {
                for (let i: number = 0; i < afterNode.annotations.length; i++) {
                    if (afterNode.annotations[i] !== beforeNode.annotations[i]) {
                        this.change(new AnnotationOrderChanged(ctx.concat("annotations"), beforeNode, afterNode, "", i))
                        break
                    }
                }
            }
        }
    }

    diffLwChunk(beforeChunk: LionWebJsonChunk, afterChunk: LionWebJsonChunk): void {
        const ctx = new JsonContext(null, ["$"])
        if (beforeChunk.serializationFormatVersion !== afterChunk.serializationFormatVersion) {
            this.change(
                new SerializationFormatChange(
                    ctx.concat("serializationFormatVersion"),
                    beforeChunk.serializationFormatVersion,
                    afterChunk.serializationFormatVersion,
                ),
            )
        }
        beforeChunk.languages.forEach((beforeLanguage: LionWebJsonUsedLanguage, index: number) => {
            const afterLanguage = ChunkUtils.findLwUsedLanguage(afterChunk, beforeLanguage.key)
            if (afterLanguage === null) {
                this.change(new LanguageRemoved(ctx.concat("languages", index), beforeLanguage))
            } else {
                this.diffLwUsedLanguage(ctx.concat("languages", index), beforeLanguage, afterLanguage)
            }
        })
        afterChunk.languages.forEach((afterLanguage: LionWebJsonUsedLanguage, index: number) => {
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
        let changeFound = false
        for (const childId of beforeContainment.children) {
            if (!afterContainment.children.includes(childId)) {
                changeFound = true
                this.change(new ChildRemoved(ctx, node, beforeContainment.containment, afterContainment, childId))
            }
        }
        for (const childId of afterContainment.children) {
            if (!beforeContainment.children.includes(childId)) {
                changeFound = true
                this.change(new ChildAdded(ctx, node, beforeContainment.containment, afterContainment, childId))
            }
        }
        if (!changeFound) {
            for (let i: number = 0; i < afterContainment.children.length; i++) {
                if (afterContainment.children[i] !== beforeContainment.children[i]) {
                    this.change(new ChildOrderChanged(ctx.concat("children"), node, afterContainment.containment, afterContainment, ""))
                    break
                }
            }
        }
    }

    diffLwReference(ctx: JsonContext, node: LionWebJsonNode, beforeRef: LionWebJsonReference, afterRef: LionWebJsonReference): void {
        if (!isEqualMetaPointer(beforeRef.reference, afterRef.reference)) {
            console.error("diffContainment: MetaPointers of references should be identical")
            this.diff(ctx, `Reference has concept ${JSON.stringify(beforeRef.reference)} vs ${JSON.stringify(afterRef.reference)}`)
        }
        let diffFound = false;
        beforeRef.targets.forEach((beforeTarget: LionWebJsonReferenceTarget, index: number) => {
            const afterTarget = NodeUtils.findReferenceTarget(afterRef.targets, beforeTarget)
            if (afterTarget === undefined) {
                this.change(new TargetRemoved(ctx.concat("targets", index), node, beforeRef, afterRef, beforeTarget))
                diffFound = true
            } else {
                if (!isEqualReferenceTarget(beforeTarget, afterTarget)) {
                    this.diff(
                        ctx.concat("targets", index),
                        `ERROR: reference target ${JSON.stringify(beforeTarget)} vs ${JSON.stringify(afterTarget)}`,
                    )
                }
            }
        })
        afterRef.targets.forEach((afterTarget: LionWebJsonReferenceTarget, index: number) => {
            const beforeTarget = NodeUtils.findReferenceTarget(beforeRef.targets, afterTarget)
            if (beforeTarget === undefined) {
                this.change(new TargetAdded(ctx.concat("targets", index), node, beforeRef, afterRef, afterTarget))
                diffFound = true
            } else {
                if (!isEqualReferenceTarget(beforeTarget, afterTarget)) {
                    this.diff(
                        ctx.concat("targets", index),
                        `ERROR: reference target ${JSON.stringify(beforeTarget)} vs ${JSON.stringify(afterTarget)}`,
                    )
                }
            }
        })
        if (!diffFound) {
            for (let i: number = 0; i < beforeRef.targets.length; i++) {
                if (!isEqualReferenceTarget(beforeRef.targets[i], afterRef.targets[i])) {
                    this.change(new TargetOrderChanged(ctx.concat("targets"), node, beforeRef, afterRef, beforeRef.targets[i]))
                    break
                }
            }
        }
    }

    private diffLwUsedLanguage(ctx: JsonContext, obj1: LionWebJsonUsedLanguage, obj2: LionWebJsonUsedLanguage) {
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
            console.error("diffContainment: MetaPointers of properties should be identical")
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
