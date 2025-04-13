import { LionWebJsonMetaPointer, LionWebJsonNode } from "@lionweb/json"
import { JsonContext } from "../json/JsonContext.js"
import { ValidationIssue } from "./ValidationIssue.js"

export class Language_PropertyValue_Issue extends ValidationIssue {
    readonly issueType = "PropertyValueIncorrect"

    constructor(
        context: JsonContext,
        public property: string,
        public value: string | null,
        public expectedType: string
    ) {
        super(context)
    }

    msg = (): string => `Property  "${this.property}" with value "${this.value}" is not of type "${this.expectedType}"`
}

// Incorrect Meta Pointers
export abstract class Language_IncorrectMetaPointerType_Issue extends ValidationIssue {
    abstract readonly metaType: string

    constructor(
        context: JsonContext,
        public metaPointer: LionWebJsonMetaPointer,
        public incorrectType: string
    ) {
        super(context)
    }

    msg = (): string =>
        `${this.metaType} with key "${this.metaPointer.key}" does not refer to a "${this.metaType}", but to a "${this.incorrectType}"`
}

export class Language_IncorrectPropertyMetaPointer_Issue extends Language_IncorrectMetaPointerType_Issue {
    readonly issueType = "IncorrectPropertyMetaPointer"
    readonly metaType = "Property"
}

export abstract class Language_FeatureMetaPointerNotInClassifier_Issue extends ValidationIssue {
    abstract readonly metaType: string
    constructor(
        context: JsonContext,
        public featureMetaPointer: LionWebJsonMetaPointer,
        public classifierPointer: LionWebJsonNode
    ) {
        super(context)
    }

    msg = (): string =>
        `${this.metaType} with key "${this.featureMetaPointer.key}" is not part of classifier "${this.classifierPointer.id}"`
}
export class Language_PropertyMetaPointerNotInClass_Issue extends Language_FeatureMetaPointerNotInClassifier_Issue {
    readonly issueType = "PropertyMetaPointerNotInClass"
    readonly metaType = "Property"
}
export class Language_ReferenceMetaPointerNotInClass_Issue extends Language_FeatureMetaPointerNotInClassifier_Issue {
    readonly issueType = "ReferenceMetaPointerNotInClass"
    readonly metaType = "Reference"
}
export class Language_ContainmentMetaPointerNotInClass_Issue extends Language_FeatureMetaPointerNotInClassifier_Issue {
    readonly issueType = "ContainmentMetaPointerNotInClass"
    readonly metaType = "Containment"
}
export class Language_IncorrectConceptMetaPointer_Issue extends Language_IncorrectMetaPointerType_Issue {
    readonly issueType = "IncorrectConceptMetaPointer"
    readonly metaType = "Concept"
}
export class Language_IncorrectReferenceMetaPointer_Issue extends Language_IncorrectMetaPointerType_Issue {
    readonly issueType = "IncorrectReferenceMetaPointer"
    readonly metaType = "Reference"
}
export class Language_IncorrectContainmentMetaPointer_Issue extends Language_IncorrectMetaPointerType_Issue {
    readonly issueType = "IncorrectContainmentMetaPointer"
    readonly metaType = "Containment"
}

// Unknown Meta Pointers
export abstract class Language_UnknownMetaPointer_Issue extends ValidationIssue {
    abstract readonly metaType: string

    constructor(
        context: JsonContext,
        public metaPointer: LionWebJsonMetaPointer
    ) {
        super(context)
    }

    msg = (): string => `${this.metaType} with key ${this.metaPointer.key} is unknown in the language`
}

export class Language_UnknownReference_Issue extends Language_UnknownMetaPointer_Issue {
    readonly issueType = "UnknownReference"
    readonly metaType = "Reference"
}
export class Language_UnknownContainment_Issue extends Language_UnknownMetaPointer_Issue {
    readonly issueType = "UnknownContainment"
    readonly metaType = "Containment"
}
export class Language_UnknownProperty_Issue extends Language_UnknownMetaPointer_Issue {
    readonly issueType = "UnknownProperty"
    readonly metaType = "Property"
}
export class Language_UnknownConcept_Issue extends Language_UnknownMetaPointer_Issue {
    readonly issueType = "UnknownConcept"
    readonly metaType = "Concept"
}

// Actual Language checks on M2
export class NumberOfLanguagesUsed_Issue extends ValidationIssue {
    readonly issueType = "NumberOfLanguagesUsed"
    constructor(
        context: JsonContext,
        public nrOfLanguages: number
    ) {
        super(context)
    }
    msg = () => `Is not a language: number of used languages should be 1, is ${this.nrOfLanguages}`
}
export class MissingM3Language_Issue extends ValidationIssue {
    readonly issueType = "MissingM3Language"
    constructor(context: JsonContext) {
        super(context)
    }
    msg = () => `Missing used language LionCore-M3`
}
export class NotLionCoreLanguageKey_Issue extends ValidationIssue {
    readonly issueType = "NotLionCoreLanguageKey"
    constructor(
        context: JsonContext,
        public incorrectKey: string
    ) {
        super(context)
    }
    msg = () => `Is not a language: the used language key is not LionCore-M3, but ${this.incorrectKey}`
}
export class IncorrectLionCoreVersion_Issue extends ValidationIssue {
    readonly issueType = "IncorrectLionCoreVersion"
    constructor(
        context: JsonContext,
        public incorrectVersion: string
    ) {
        super(context)
    }
    msg = () => `Is not a language: the used language version is not 1, but ${this.incorrectVersion}`
}
