import { JsonContext } from "@lionweb/json-utils"

export type ChangeType =
    | "GenericChange"
    | "NodeRemoved"
    | "NodeAdded"
    | "ChildRemoved"
    | "ChildAdded"
    | "ParentChanged"
    | "PropertyValueChanged"
    | "SerializationFormatChange"
    | "PropertyDeleted"
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
 * Additional property in property, containment and reference changes to state
 * that the whole property/ containment / reference definition is missing either before or after.
 */
export enum FeatureMissing {
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

/**
 * A `Change` describes something that is different in the after chunk compared to the before chunk.
 */
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
