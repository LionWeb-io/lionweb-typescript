import { JsonContext } from "../../issues/index.js"
import { LionWebJsonNode } from "../../json/index.js"
import { Change, ChangeType } from "./Change.js"

export class NodeClassifierChanged extends Change {
    readonly id: ChangeType = "NodeClassifierChanged"

    constructor(
        public context: JsonContext,
        public node: LionWebJsonNode,
        public oldClassifierKey: string,
        public newClassifierKey: string,
    ) {
        super(context)
    }
    protected msg = () => `Object ${this.node.id} has classifier changed from ${this.oldClassifierKey} to ${this.newClassifierKey}`
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
