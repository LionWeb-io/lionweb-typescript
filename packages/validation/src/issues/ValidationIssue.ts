import { JsonContext } from "../json/JsonContext.js"

export abstract class ValidationIssue {
    abstract readonly issueType: string
    context: JsonContext

    constructor(context: JsonContext) {
        this.context = context
    }

    protected abstract msg(): string

    public errorMsg(): string {
        return `${this.issueType}: ${this.msg()} at ${this.context.toString()} `
    }
}

export class GenericIssue extends ValidationIssue {
    readonly issueType = "GenericIssue"
    
    constructor(context: JsonContext, public text: string) {
        super(context)
    }
    
    protected msg = () => this.text
}
