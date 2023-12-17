import { JsonContext } from "../../issues/index.js"
import { LionWebJsonNode } from "../../json/index.js"
import { Change } from "./Change.js"

export abstract class ReferenceChange extends Change {
    constructor(
        public context: JsonContext,
        public parentNode: LionWebJsonNode,
        public referenceKey: string,
        public childId: string,
    ) {
        super(context)
    }
}

export class TargetAdded extends ReferenceChange {
    readonly id = "TargetAdded"
    protected msg = () => `Node "${this.parentNode.id}" added child "${this.childId}" to reference "${this.referenceKey}"`
}

export class TargetRemoved extends ReferenceChange {
    readonly id = "TargetRemoved"
    protected msg = () => `Node "${this.parentNode.id}" removed child "${this.childId}" from reference "${this.referenceKey}"`
}
