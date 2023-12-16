import { JsonContext } from "../../issues/index.js"
import { LionWebJsonContainment, LionWebJsonNode } from "../../json/index.js"
import { Change } from "./Change.js"

export abstract class ContainmentValueChange extends Change {
    constructor(
        public context: JsonContext,
        public parentNode: LionWebJsonNode,
        public containmentKey: string,
        public childId: string,
    ) {
        super(context)
    }
}

export class ChildAdded extends ContainmentValueChange {
    readonly id = "ChildAdded"
    protected msg = () => `Node "${this.parentNode.id}" added child "${this.childId}" to containment ${this.containmentKey}`
}

export class ChildRemoved extends ContainmentValueChange {
    readonly id = "ChildRemoved"
    protected msg = () => `Node "${this.parentNode.id}" removed child "${this.childId}"`
}

export abstract class ContainmentChange extends Change {
    constructor(
        public context: JsonContext,
        public node: LionWebJsonNode,
        public containment: LionWebJsonContainment,
    ) {
        super(context)
    }
}

export class ContainmentAdded extends ContainmentChange {
    readonly id = "ContainmentAdded"
    protected msg = () =>
        `Node "${this.node.id}: containment with key ${this.containment.containment.key} is added with value ${this.containment.children}`
}

export class ContainmentRemoved extends ContainmentChange {
    readonly id = "ContainmentRemoved"
    protected msg = () =>
        `Node "${this.node.id}: containment with key ${this.containment.containment.key} is removed, old value was ${this.containment.children}`
}
