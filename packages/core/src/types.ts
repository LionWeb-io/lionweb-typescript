import { LionWebId } from "@lionweb/json"

/**
 * Type definition for a LionWeb-compliant AST node.
 */
export type Node = {
    id: LionWebId
    parent?: Node
    annotations: Node[]
}

