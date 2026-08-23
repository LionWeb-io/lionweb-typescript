import { LionWebId, LionWebJsonMetaPointer, LionWebJsonNode } from "@lionweb/json"
import { JsonContext } from "@lionweb/json-utils"
import { asMinimalJsonString } from "@lionweb/ts-utils"
import { Change, FeatureMissing } from "./Change.js"

export abstract class PropertyChange extends Change {
    constructor(
        public context: JsonContext,
        public nodeId: LionWebId,
        public property: LionWebJsonMetaPointer,
        public oldValue: string | null,
        public newValue: string | null,
    ) {
        super(context)
    }
}

export class PropertyValueChanged extends PropertyChange {
    readonly changeType = "PropertyValueChanged"
    protected msg = () =>
        `Node "${this.nodeId} property "${this.property.key}" value changed from "${this.oldValue}" to "${this.newValue}"`
}

export class PropertyAdded extends PropertyChange {
    readonly changeType = "PropertyAdded"
    constructor(
        context: JsonContext,
        nodeId: LionWebId,
        property: LionWebJsonMetaPointer,
        newValue: string | null,
    ) {
        super(context, nodeId, property, null, newValue)
    }

    protected msg = () => `Node "${this.nodeId}' property added: '${asMinimalJsonString(this.property)}' with value '${this.newValue}'`
}

export class PropertyDeleted extends PropertyChange {
    readonly changeType = "PropertyDeleted"
    constructor(
        context: JsonContext,
        nodeId: LionWebId,
        property: LionWebJsonMetaPointer,
        oldValue: string | null,
    ) {
        super(context, nodeId, property, oldValue, null)
    }

    protected msg = () => `Node "${this.nodeId}" property deleted: "${asMinimalJsonString(this.property)}"`
}
