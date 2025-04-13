import { LionWebJsonNode, LionWebJsonReference, LionWebJsonReferenceTarget } from "@lionweb/json"
import { JsonContext } from "../../issues/index.js"
import { Change, Missing } from "./Change.js"

export abstract class ReferenceChange extends Change {
    constructor(
        public context: JsonContext,
        public node: LionWebJsonNode,
        public beforeReference: LionWebJsonReference | undefined,
        public afterReference: LionWebJsonReference | undefined,
        public target: LionWebJsonReferenceTarget,
        public missing = Missing.NotMissing
    ) {
        super(context)
    }
}

export class TargetAdded extends ReferenceChange {
    readonly changeType = "TargetAdded"
    protected msg = () =>
        `Node "${this.node.id}" added target "${this.target.reference}" to reference "${this?.afterReference?.reference?.key}"`
}

export class TargetRemoved extends ReferenceChange {
    readonly changeType = "TargetRemoved"
    protected msg = () =>
        `Node "${this.node.id}" removed target "${this.target.reference}" from reference "${this?.beforeReference?.reference?.key}"`
}

export class TargetOrderChanged extends ReferenceChange {
    readonly changeType = "TargetOrderChanged"
    protected msg = () => `Node "${this.node.id}" changed order of targets in reference "${this.afterReference?.reference?.key}"`
}
