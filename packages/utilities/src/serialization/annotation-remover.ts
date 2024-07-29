import {Annotation, Language, MemoisingSymbolTable, SerializationChunk} from "@lionweb/core"

/**
 * Removes all annotation-related instance data from the given {@link SerializationChunk}, i.e.:
 *  * all nodes that are instances of an {@link Annotation},
 *  * all annotation on nodes.
 * @param serializationChunk - The {@link SerializationChunk}
 * @param languages - An array of {@link Language languages} to determine what nodes are instances of annotations
 */
export const withoutAnnotations = (serializationChunk: SerializationChunk, languages: Language[]) => {
    const symbolTable = new MemoisingSymbolTable(languages)
    const {serializationFormatVersion, languages: dependentLanguages, nodes} = serializationChunk
    return {
        serializationFormatVersion,
        languages: dependentLanguages,
        nodes: nodes
            .filter((node) => !(symbolTable.entityMatching(node.classifier) instanceof Annotation)) // removes instances of annotations
            .map((node) =>  {
                node.annotations = []   // removes annotations being attached to nodes that are instances of concepts
                return node
            })
    }
}

