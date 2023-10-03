export class IssueContext {
    location: string
    constructor(loc: string) {
        this.location = loc;
    }
}

export abstract class ValidationIssue {
    abstract readonly id: string;
    context: IssueContext;
    
    constructor(context: IssueContext) {
        this.context = context;
    }

    protected abstract msg(): string;
    
    public errorMsg(): string {
        return `${this.id}: ${this.msg()} at ${this.context.location} `
    }
}

class X {
    constructor(public y: string) {
    }
}

const xx = new X("ppp");
console.log("=> " + xx.y);
