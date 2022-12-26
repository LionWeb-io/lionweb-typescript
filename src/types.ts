export type Id = string

export type Node = {
    id: Id
}

export const asIds = (nodes: Node[]): Id[] =>
    nodes.map(({id}) => id)

