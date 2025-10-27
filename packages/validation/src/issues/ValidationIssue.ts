import { JsonContext } from "@lionweb/json-utils"

export abstract class ValidationIssue {
    abstract readonly issueType: string
    context: JsonContext | null

    constructor(context: JsonContext | null) {
        this.context = context
    }

    protected abstract msg(): string

    public errorMsg(): string {
        return `${this.issueType}: ${this.msg()} at ${this.context?.toString()} `
    }
}

export class GenericIssue extends ValidationIssue {
    readonly issueType = "GenericIssue"

    constructor(
        context: JsonContext | null,
        public text: string
    ) {
        super(context)
    }

    protected msg = () => this.text
}
