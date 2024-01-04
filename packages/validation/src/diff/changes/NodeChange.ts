import { JsonContext } from "../../issues/index.js"
import { LionWebJsonMetaPointer, LionWebJsonNode } from "../../json/index.js"
import { Change, ChangeType } from "./Change.js"

export class NodeClassifierChanged extends Change {
    readonly changeType: ChangeType = "NodeClassifierChanged"

    constructor(
        public context: JsonContext,
        public node: LionWebJsonNode,
        public oldClassifier: LionWebJsonMetaPointer,
        public newClassifier: LionWebJsonMetaPointer,
    ) {
        super(context)
    }

    protected msg = () => `Object ${this.node.id} has classifier changed from ${this.oldClassifier.key} to ${this.newClassifier.key}`
}

export class ParentChanged extends Change {
    readonly changeType = "ParentChanged"

    constructor(
        public context: JsonContext,
        public node: LionWebJsonNode,
        public beforeParentId: string | null,
        public afterParentId: string | null,
    ) {
        super(context)
    }

    protected msg = () => `Node "${this.node.id}" changed parent from "${this.beforeParentId}" to "${this.afterParentId}`
}

export abstract class AnnotationChange extends Change {
    constructor(
        ctx: JsonContext,
        public nodeBefore: LionWebJsonNode,
        public nodeAfter: LionWebJsonNode,
        public annotationId: string,
        public index: number
    ) {
        super(ctx)
    }
}

export class AnnotationRemoved extends AnnotationChange {
    readonly changeType = "AnnotationRemoved"

    protected msg = () => `Node "${this.nodeBefore.id}" removed annotation "${this.annotationId}"`
}

export class AnnotationAdded extends AnnotationChange {
    readonly changeType = "AnnotationAdded"

    protected msg = () => `Node "${this.nodeAfter.id}" added annotation "${this.annotationId}"`
}


export class AnnotationOrderChanged extends AnnotationChange {
    readonly changeType = "AnnotationOrderChanged"
    protected msg = () => `Node "${this.nodeAfter.id}" changed order of annotations`
}
