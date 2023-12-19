import { JsonContext } from "../../issues/index.js"
import { LionWebJsonContainment, LionWebJsonMetaPointer, LionWebJsonNode } from "../../json/index.js"
import { Change, ChangeType } from "./Change.js"

export abstract class ContainmentChange extends Change {
    constructor(
        public context: JsonContext,
        public parentNode: LionWebJsonNode,
        public containment: LionWebJsonMetaPointer,
        public childId: string,
    ) {
        super(context)
    }
}

export class ChildAdded extends ContainmentChange {
    readonly id = "ChildAdded"
    protected msg = () => `Node "${this.parentNode.id}" added child "${this.childId}" to containment ${this.containment.key}`
}

export class ChildRemoved extends ContainmentChange {
    readonly id = "ChildRemoved"
    protected msg = () => `Node "${this.parentNode.id}" removed child "${this.childId}"`
}

export class ContainmentAdded extends Change {
    readonly id = "ContainmentAdded";
    constructor(ctx: JsonContext, public node: LionWebJsonNode, public containment: LionWebJsonMetaPointer) {
        super(ctx)
    }

    protected msg = () => `Node "${this.node.id}" containment added: "${JSON.stringify(this.containment)}"`
}

