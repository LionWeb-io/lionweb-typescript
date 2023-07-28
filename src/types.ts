/**
 * Type definition for LIonWeb-compliant IDs of AST nodes.
 */
export type Id = string

/**
 * Type definition for a LIonWeb-compliant AST node.
 */
export type Node = {
    id: Id
    parent?: Node
}

