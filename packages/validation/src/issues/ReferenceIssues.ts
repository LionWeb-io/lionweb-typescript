import { LionWebJsonMetaPointer, LionWebJsonNode } from "../json/LionWebJson";
import { IssueContext, ValidationIssue } from "./ValidationIssue";

export class Reference_DuplicateNodeId_Issue extends ValidationIssue {
    readonly id = "DuplicateNodeId";
    
    constructor(context: IssueContext, public nodeId: string) {
        super(context);
    }
    
    msg = () : string => `Node has duplicate id "${this.nodeId}"`
}

export class Reference_ChildMissingInParent_Issue extends ValidationIssue {
    readonly id = "ChildMissingInParent";

    constructor(context: IssueContext, public child: LionWebJsonNode, public parent: LionWebJsonNode) {
        super(context);
    }

    msg = () : string => `Node with id "${this.child.id}" has parent with id "${this.parent.id}" but parent does not contains it as a child.`
}

export class Reference_ParentMissingInChild_Issue extends ValidationIssue {
    readonly id = "ParentMissingInChild";

    constructor(context: IssueContext, public parent: LionWebJsonNode, public child: LionWebJsonNode) {
        super(context);
    }

    msg = () : string => `Node with id "${this.parent.id}" has child with id "${this.child.id}" but child has empty parent.`
}

export class Reference_CirculairParent_Issue extends ValidationIssue {
    readonly id = "CirculairParent";

    constructor(context: IssueContext, public node: LionWebJsonNode | undefined, public parentPath: string[]) {
        super(context);
    }

    msg = () : string => `Node with id "${this.node?.id}" has circulair parent through "${this.parentPath}".`
}

export class Reference_LanguageUnknown_Issue extends ValidationIssue {
    readonly id = "LanguageUnknown";
    
    constructor(context: IssueContext, public languageRef: LionWebJsonMetaPointer) {
        super(context);
    }
    msg = () => `Node uses language { language = ${this.languageRef.language}, version = ${this.languageRef.version} } which is not declared in used languages`
}

export class Duplicates_Issue extends ValidationIssue {
    readonly id = "Duplicates";

    constructor(context: IssueContext, public nodeid: string) {
        super(context);
    }
    msg = () => `Duplicate value "${this.nodeid}"`
}