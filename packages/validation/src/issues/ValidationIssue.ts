import { JsonContext } from "./JsonContext.js"

export abstract class ValidationIssue {
    abstract readonly id: string
    context: JsonContext

    constructor(context: JsonContext) {
        this.context = context
    }

    protected abstract msg(): string

    public errorMsg(): string {
        return `${this.id}: ${this.msg()} at ${this.context.toString()} `
    }
}
