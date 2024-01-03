import { JsonContext } from "../../issues/index.js"
import { LionWebJsonNode, LionWebJsonReference, LionWebJsonReferenceTarget } from "../../json/index.js"
import { Change, Missing } from "./Change.js"

export abstract class ReferenceChange extends Change {
    constructor(
        public context: JsonContext,
        public node: LionWebJsonNode,
        public beforeReference: LionWebJsonReference | null,
        public afterReference: LionWebJsonReference | null,
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
