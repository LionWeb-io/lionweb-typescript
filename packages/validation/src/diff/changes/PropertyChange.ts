import { JsonContext } from "../../issues/index.js"
import { Change } from "./Change.js"

export abstract class PropertyChange extends Change {
    constructor(
        public context: JsonContext,
        public nodeId: string,
        public propertyKey: string,
        public oldValue: string | undefined,
        public newValue: string | undefined,
    ) {
        super(context)
    }
}

export class PropertyValueChanged extends PropertyChange {
    readonly id = "PropertyValueChanged"
    protected msg = () => `Node "${this.nodeId} changed value of property "${this.propertyKey}" from "${this.oldValue}" to "${this.newValue}"`
}
