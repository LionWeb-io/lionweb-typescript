import { JsonContext } from "../json/JsonContext.js"
import { ValidationIssue } from "./ValidationIssue.js"

export abstract class Syntax_PropertyIssue extends ValidationIssue {
    constructor(
        public context: JsonContext,
        protected property: string,
    ) {
        super(context)
    }
}

export class Syntax_PropertyMissingIssue extends Syntax_PropertyIssue {
    readonly issueType = "PropertyMissing"
    protected msg = () => `Property "${this.property}" is missing`
}

export class Syntax_PropertyUnknownIssue extends Syntax_PropertyIssue {
    readonly issueType = "PropertyUnknown"
    protected msg = () => `Property "${this.property}" is not defined as a LionWeb property`
}

export class Syntax_PropertyNullIssue extends Syntax_PropertyIssue {
    readonly issueType = "PropertyNull"
    protected msg = () => `Property "${this.property}" is null, but it should have a value`
}

export class Syntax_PropertyTypeIssue extends Syntax_PropertyIssue {
    readonly issueType = "PropertyTypeIncorrect"

    constructor(
        context: JsonContext,
        property: string,
        protected expectedType: string,
        protected actualType: string,
    ) {
        super(context, property)
    }

    protected msg = () => `Property ${this.property} should have type "${this.expectedType}", but has type "${this.actualType}"`
}

export class Syntax_ArrayContainsNull_Issue extends Syntax_PropertyIssue {
    readonly issueType = "ArrayContainsNull"

    constructor(
        context: JsonContext,
        property: string,
        public index: number,
    ) {
        super(context, property)
    }

    protected msg = () => `Property "${this.property}" of type array contains null at index "${"" + this.index}" `
}

export abstract class Syntax_IncorrectFormat_Issue extends ValidationIssue {
    constructor(
        context: JsonContext,
        public value: string,
    ) {
        super(context)
    }
}

export class Syntax_SerializationFormatVersion_Issue extends Syntax_IncorrectFormat_Issue {
    readonly issueType = "SerializationFormatVersion"
    protected msg = () => `SerializationFormatVersion "${this.value}" is not a number`
}

export class Syntax_VersionFormat_Issue extends Syntax_IncorrectFormat_Issue {
    readonly issueType = "VersionFormat"
    protected msg = () => `Version "${this.value}" is an empty string.`
}

export class Syntax_KeyFormat_Issue extends Syntax_IncorrectFormat_Issue {
    readonly issueType = "KeyFormat"
    protected msg = () => `Key "${this.value}" has incorrect format.`
}

export class Syntax_IdFormat_Issue extends Syntax_IncorrectFormat_Issue {
    readonly issueType = "IdFormat"
    protected msg = () => `Id "${this.value}" has incorrect format.`
}
