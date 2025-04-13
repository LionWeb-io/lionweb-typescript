import { LionWebJsonContainment, LionWebJsonMetaPointer, LionWebJsonNode } from "@lionweb/json"
import { JsonContext } from "../../issues/index.js"
import { Change, Missing } from "./Change.js"

export abstract class ContainmentChange extends Change {
    constructor(
        public context: JsonContext,
        public parentNode: LionWebJsonNode,
        public containment: LionWebJsonMetaPointer,
        public afterContainment: LionWebJsonContainment | undefined,
        public childId: string,
        public missing = Missing.NotMissing
    ) {
        super(context)
    }
}

export class ChildAdded extends ContainmentChange {
    readonly changeType = "ChildAdded"
    protected msg = () => `Node "${this.parentNode.id}" added child "${this.childId}" to containment ${this.containment.key}`
}

export class ChildRemoved extends ContainmentChange {
    readonly changeType = "ChildRemoved"
    protected msg = () => `Node "${this.parentNode.id}" removed child "${this.childId}" from containment "${this.containment.key}"`
}

export class ChildOrderChanged extends ContainmentChange {
    readonly changeType = "ChildOrderChanged"
    protected msg = () => `Node "${this.parentNode.id}" changed order of children in containment "${this.containment.key}"`
}
