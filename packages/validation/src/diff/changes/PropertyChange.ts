import { JsonContext } from "../../issues/index.js"
import { LionWebJsonMetaPointer, LionWebJsonNode } from "../../json/index.js"
import { Change } from "./Change.js"

export abstract class PropertyChange extends Change {
    constructor(
        public context: JsonContext,
        public nodeId: string,
        public property: LionWebJsonMetaPointer,
        public oldValue: string | undefined,
        public newValue: string | undefined,
    ) {
        super(context)
    }
}

export class PropertyValueChanged extends PropertyChange {
    readonly id = "PropertyValueChanged"
    protected msg = () => `Node "${this.nodeId} changed value of property "${this.property.key}" from "${this.oldValue}" to "${this.newValue}"`
}

export class PropertyAdded extends Change {
    readonly id = "PropertyAdded";
    constructor(ctx: JsonContext, public node: LionWebJsonNode, public property: LionWebJsonMetaPointer) {
        super(ctx)
    }

    protected msg = () => `Node "${this.node.id}" containment added: "${JSON.stringify(this.property)}"`
}
