import { LionWebJsonMetaPointer, LionWebJsonNode, LionWebJsonProperty } from "../json/LionWebJson";
import { IssueContext, ValidationIssue } from "./ValidationIssue";

export class Language_PropertyValue_Issue extends ValidationIssue {
    readonly id = "PropertyValue";

    constructor(context: IssueContext, public property: string, public value: string,public expectedType: string  ) {
        super(context);
    }

    msg = (): string => `Property  "${this.property}" with value "${this.value}" is not of type "${this.expectedType}"`
}

// Incorrect Meta Pointers
export abstract class Language_IncorrectMetaPointerType_Issue extends ValidationIssue {
    abstract readonly metaType: string;

    constructor(context: IssueContext, public metaPointer: LionWebJsonMetaPointer, public incorrectType: string) {
        super(context);
    }

    msg = (): string => `${this.metaType} with key "${this.metaPointer.key}" does not refer to a ${this.metaType}, but to a "${this.incorrectType}"`
}

export class Language_IncorrectPropertyMetaPointer_Issue extends Language_IncorrectMetaPointerType_Issue {
    readonly id = "IncorrectPropertyMetaPointer";
    readonly metaType = "Property";
}
export class Language_IncorrectConceptMetaPointer_Issue extends Language_IncorrectMetaPointerType_Issue {
    readonly id = "IncorrectConceptMetaPointer";
    readonly metaType = "Concept";
}
export class Language_IncorrectReferenceMetaPointer_Issue extends Language_IncorrectMetaPointerType_Issue {
    readonly id = "IncorrectReferenceMetaPointer";
    readonly metaType = "Reference";
}
export class Language_IncorrectContainmentMetaPointer_Issue extends Language_IncorrectMetaPointerType_Issue {
    readonly id = "IncorrectContainmentMetaPointer";
    readonly metaType = "Containment";
}

// Unknown Meta Pointers
export abstract class Language_UnknownMetaPointer_Issue extends ValidationIssue {
    abstract readonly metaType: string;

    constructor(context: IssueContext, public metaPointer: LionWebJsonMetaPointer) {
        super(context);
    }

    msg = (): string => `${this.metaType} with key ${this.metaPointer.key} is unknown in the language`;
}

export class Language_UnknownReference_Issue extends Language_UnknownMetaPointer_Issue {
    readonly id = "UnknownReference";
    readonly metaType = "Reference";
}
export class Language_UnknownContainment_Issue extends Language_UnknownMetaPointer_Issue {
    readonly id = "UnknownContainment";
    readonly metaType = "Containment";
}
export class Language_UnknownProperty_Issue extends Language_UnknownMetaPointer_Issue {
    readonly id = "UnknownProperty";
    readonly metaType = "Property";
}
export class Language_UnknownConcept_Issue extends Language_UnknownMetaPointer_Issue {
    readonly id = "UnknownConcept";
    readonly metaType = "Concept";
}

// Actual Language checks on M2
export class NumberOfLanguagesUsed_Issue extends ValidationIssue {
    readonly id = "NumberOfLanguagesUsed";
    constructor(context: IssueContext, public nrOfLanguages: number) {
        super(context);
    }
    msg = () => `Is not a language: number of used languages should be 1, is ${this.nrOfLanguages}`
}
export class NotLionCoreLanguageKey_Issue extends ValidationIssue {
    readonly id = "NotLionCoreLanguageKey";
    constructor(context: IssueContext, public incorrectKey: string) {
        super(context);
    }
    msg = () => `Is not a language: the used language key is not LionCore-M3, but ${this.incorrectKey}`
}
export class IncorrectLionCoreVersion_Issue extends ValidationIssue {
    readonly id = "IncorrectLionCoreVersion";
    constructor(context: IssueContext, public incorrectVersion: string) {
        super(context);
    }
    msg = () => `Is not a language: the used language version is not 1, but ${this.incorrectVersion}`
}
