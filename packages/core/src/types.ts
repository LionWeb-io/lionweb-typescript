/**
 * Type definition for LionWeb-compliant IDs of AST nodes.
 */
export type Id = string


const base64urlRegex = /^[A-Za-z0-9_-]+$/

/**
 * @return whether the given string is a valid identifier according to the LionWeb specification – see [here](https://github.com/LionWeb-io/specification/blob/main/2023.1/metametamodel/metametamodel.adoc#identifiers) for the relevant part.
 * This is essentially whether the given string is a valid, non-empty [Base64url](https://en.wikipedia.org/wiki/Base64#Variants_summary_table) string.
 */
export const isValidIdentifier = (str: string): boolean =>
    base64urlRegex.test(str)


/**
 * Type definition for a LionWeb-compliant AST node.
 */
export type Node = {
    id: Id
    parent?: Node
    annotations: Node[]
}

