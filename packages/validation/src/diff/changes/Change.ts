import { JsonContext } from "../../issues/index.js"

export type ChangeType =
    | "GenericChange"
    | "NodeRemoved"
    | "NodeAdded"
    | "ChildRemoved"
    | "ChildAdded"
    | "ParentChanged"
    | "PropertyValueChanged"
    | "SerializationFormatChange"
    | "PropertyRemoved"
    | "PropertyAdded"
    | "NodeClassifierChanged"
    | "ContainmentAdded"
    | "ContainmentRemoved"
    | "LanguageRemoved"
    | "LanguageAdded"
    | "TargetAdded"
    | "TargetRemoved"
    | "ReferenceRemoved"
    | "ReferenceAdded"
    | "AnnotationRemoved"
    | "AnnotationAdded"
    | "ChildOrderChanged"
    | "AnnotationOrderChanged"
    | "TargetOrderChanged"

/**
 * Additionbal property in property, contauinment and reference changes to state
 * that the whole property/ containment / reference definition is missing.
 */
export enum Missing {
    /**
     * Both before and after have a definition for the property / containment / reference
     */
    NotMissing,
    /**
     * The definition is missing _before_ for the property / containment / reference
     */
    MissingBefore,
    /**
     * The definition is missing _after_ for the property / containment / reference
     */
    MissingAfter
}

export abstract class Change {
    abstract readonly changeType: ChangeType
    context: JsonContext

    constructor(context: JsonContext) {
        this.context = context
    }

    protected abstract msg(): string

    public changeMsg(): string {
        return `${this.changeType}: ${this.msg()} at ${this.context.toString()} `
    }
}

export class GenericChange extends Change {
    readonly changeType = "GenericChange"

    constructor(
        context: JsonContext,
        protected message: string
    ) {
        super(context)
    }

    protected msg(): string {
        return this.message
    }
}
