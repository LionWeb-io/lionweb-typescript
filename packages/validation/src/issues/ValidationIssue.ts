type JsonPath = (string | number)[];

export class JsonContext {
    private parent: JsonContext | null;
    private local_path: JsonPath;
    
    concat(... items: JsonPath) : JsonContext {
        return new JsonContext(this, items);
    }
    
    path(): JsonPath {
        return this.parent === null ? this.local_path : this.parent.path().concat(this.local_path);
    }
    
    constructor(parent: JsonContext | null, path: JsonPath) {
        this.parent = parent;
        this.local_path = path;
    }
    
    toString(): string {
        let result = "";
        this.path().forEach((part, index) => {
            if (typeof part === "string") {
                result += (index === 0 ? "" : ".") + part;
            } else if (typeof part === "number") {
                result += "[" + part + "]";
            }
        });
        return result;
    }
}

export abstract class ValidationIssue {
    abstract readonly id: string;
    context: JsonContext;
    
    constructor(context: JsonContext) {
        this.context = context;
    }

    protected abstract msg(): string;
    
    public errorMsg(): string {
        return `${this.id}: ${this.msg()} at ${this.context.toString()} `
    }
}
