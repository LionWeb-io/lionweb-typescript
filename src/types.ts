/**
 * Type definition for LIonWeb-compliant IDs of AST nodes.
 */
export type Id = string

/**
 * Type definition for a LIonWeb-compliant AST node.
 */
export type Node = {
    id: Id
}

/**
 * Maps an array of {@link Node AST nodes} to their IDs.
 */
export const asIds = (nodes: Node[]): Id[] =>
    nodes.map(({id}) => id)

