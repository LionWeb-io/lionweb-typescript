import { JsonContext } from "../../issues/index.js"
import { LionWebJsonMetaPointer, LionWebJsonNode } from "../../json/index.js"
import { Change } from "./Change.js"

export abstract class ReferenceChange extends Change {
    constructor(
        public context: JsonContext,
        public node: LionWebJsonNode,
        public reference: LionWebJsonMetaPointer,
        public targetId: string,
    ) {
        super(context)
    }
}

export class TargetAdded extends ReferenceChange {
    readonly id = "TargetAdded"
    protected msg = () => `Node "${this.node.id}" added target "${this.targetId}" to reference "${this.reference.key}"`
}

export class TargetRemoved extends ReferenceChange {
    readonly id = "TargetRemoved"
    protected msg = () => `Node "${this.node.id}" removed target "${this.targetId}" from reference "${this.reference.key}"`
}
