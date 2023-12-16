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
    protected msg = () => `Node "${this.nodeId} changed value of property "${this.propertyKey}"`
}

export class PropertyAdded extends PropertyChange {
    readonly id = "PropertyAdded"
    protected msg = () => `Node "${this.nodeId}: property with concept key ${this.propertyKey} is added with value ${this.newValue}`
}

export class PropertyRemoved extends PropertyChange {
    readonly id = "PropertyRemoved"
    protected msg = () => `Node "${this.nodeId} : property with concept key ${this.propertyKey} is removed, old value was ${this.oldValue}`
}
