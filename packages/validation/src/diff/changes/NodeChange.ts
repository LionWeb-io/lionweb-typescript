import { JsonContext } from "../../issues/index.js"
import { LionWebJsonMetaPointer, LionWebJsonNode } from "../../json/index.js"
import { Change, ChangeType } from "./Change.js"

export class NodeClassifierChanged extends Change {
    readonly id: ChangeType = "NodeClassifierChanged"

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
    readonly id = "ParentChanged"

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

export class AnnotationRemoved extends Change {
    readonly id = "AnnotationRemoved"

    constructor(
        ctx: JsonContext,
        public node: LionWebJsonNode,
        public annotationId: string,
        public index: number
    ) {
        super(ctx)
    }

    protected msg = () => `Node "${this.node.id}" removed annotation "${this.annotationId}"`
}

export class AnnotationAdded extends Change {
    readonly id = "AnnotationAdded"

    constructor(
        ctx: JsonContext,
        public node: LionWebJsonNode,
        public annotationId: string,
        public index: number
    ) {
        super(ctx)
    }

    protected msg = () => `Node "${this.node.id}" added annotation "${this.annotationId}"`
}
