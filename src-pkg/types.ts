/**
 * Type definition for LionWeb-compliant IDs of AST nodes.
 */
export type Id = string

/**
 * Type definition for a LionWeb-compliant AST node.
 */
export type Node = {
    id: Id
    parent?: Node
}

