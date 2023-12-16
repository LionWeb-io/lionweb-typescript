import { JsonContext } from "../../issues/index.js"
import { LionWebJsonNode, LionWebJsonReference } from "../../json/index.js"
import { Change } from "./Change.js"

export abstract class ReferenceValueChange extends Change {
    constructor(
        public context: JsonContext,
        public parentNode: LionWebJsonNode,
        public containmentKey: string,
        public childId: string,
    ) {
        super(context)
    }
}

export class TargetAdded extends ReferenceValueChange {
    readonly id = "TargetAdded"
    protected msg = () => `Node "${this.parentNode.id}" added child "${this.childId}" to containment ${this.containmentKey}`
}

export class TargetRemoved extends ReferenceValueChange {
    readonly id = "TargetRemoved"
    protected msg = () => `Node "${this.parentNode.id}" removed child "${this.childId}"`
}

export abstract class ReferenceChange extends Change {
    constructor(
        public context: JsonContext,
        public node: LionWebJsonNode,
        public reference: LionWebJsonReference,
    ) {
        super(context)
    }
}

export class ReferenceAdded extends ReferenceChange {
    readonly id = "ReferenceAdded"
    protected msg = () =>
        `Node "${this.node.id}: reference with key ${this.reference.reference.key} is added with value ${this.reference.targets.map(
            t => t.reference,
        )}`
}

export class ReferenceRemoved extends ReferenceChange {
    readonly id = "ReferenceRemoved"
    protected msg = () =>
        `Node "${this.node.id}: reference with key ${this.reference.reference.key} is removed, old value was ${this.reference.targets.map(
            t => t.reference,
        )}`
}
