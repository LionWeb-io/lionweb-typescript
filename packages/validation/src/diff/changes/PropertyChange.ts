import { LionWebId, LionWebJsonMetaPointer, LionWebJsonNode } from "@lionweb/json"
import { JsonContext } from "../../issues/index.js"
import { Change, Missing } from "./Change.js"

export abstract class PropertyChange extends Change {
    constructor(
        public context: JsonContext,
        public nodeId: LionWebId,
        public property: LionWebJsonMetaPointer,
        public oldValue: string | null,
        public newValue: string | null,
        public missing: Missing = Missing.NotMissing
    ) {
        super(context)
    }
}

export class PropertyValueChanged extends PropertyChange {
    readonly changeType = "PropertyValueChanged"
    protected msg = () =>
        `Node "${this.nodeId} changed value of property "${this.property.key}" from "${this.oldValue}" to "${this.newValue}"`
}

export class PropertyAdded extends Change {
    readonly changeType = "PropertyAdded"
    constructor(
        ctx: JsonContext,
        public node: LionWebJsonNode,
        public property: LionWebJsonMetaPointer
    ) {
        super(ctx)
    }

    protected msg = () => `Node "${this.node.id}" containment added: "${JSON.stringify(this.property)}"`
}
