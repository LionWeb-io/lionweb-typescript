import { JsonContext } from "../../issues/index.js"
import { LionWebJsonContainment, LionWebJsonNode } from "../../json/index.js"
import { Change } from "./Change.js"

export abstract class ContainmentChange extends Change {
    constructor(
        public context: JsonContext,
        public parentNode: LionWebJsonNode,
        public containmentKey: string,
        public childId: string,
    ) {
        super(context)
    }
}

export class ChildAdded extends ContainmentChange {
    readonly id = "ChildAdded"
    protected msg = () => `Node "${this.parentNode.id}" added child "${this.childId}" to containment ${this.containmentKey}`
}

export class ChildRemoved extends ContainmentChange {
    readonly id = "ChildRemoved"
    protected msg = () => `Node "${this.parentNode.id}" removed child "${this.childId}"`
}


