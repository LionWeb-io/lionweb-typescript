import {conceptsOf, groupBy, Language, MemoisingSymbolTable, MetaPointer, SerializationChunk} from "@lionweb/core"


type ClassifierInstantiationMetric = {
    key: string         // key of classifier
    language: string    // key of language
    version: string     // version of language
    name?: string       // name when it can be looked up
    count: number       // the number of instantiations
    // TODO  add property to say the classifier is a concept, or annotation (or enum)?
}

type Metrics = {
    instantiations: ClassifierInstantiationMetric[]
    unusedConcreteConcepts: MetaPointer[]
}

/**
 * Computes {@link Metrics metrics} on the given {@link SerializationChunk serializationChunk}.
 * Passing it {@link Language languages} make this language-aware:
 *  * classifier names are looked up,
 *  * unused concrete concepts are computed as well.
 */
export const measure = (serializationChunk: SerializationChunk, languages: Language[]): Metrics => {
    const symbolTable = new MemoisingSymbolTable(languages)

    const metaPointerAsText = (classifier: MetaPointer) => `${classifier.key}:${classifier.language}:${classifier.version}`

    // group nodes by classifier key, language, and version:
    const groupedInstantiations = groupBy(serializationChunk.nodes, ({ classifier }) => metaPointerAsText(classifier))

    // map grouped nodes to instantiations with count:
    const instantiations = Object.values(groupedInstantiations).map((nodes) => ({
        ...nodes[0].classifier,
        name: symbolTable.entityMatching(nodes[0].classifier)?.name,
        count: nodes.length
    }))

    // compute all concrete concepts for the language:
    const concreteConcepts = languages.flatMap(conceptsOf).filter((concept) => !concept.abstract)
    const unusedConcreteConcepts = concreteConcepts
        .map((concept) => concept.metaPointer())
        .filter((metaPointer) => !(metaPointerAsText(metaPointer) in groupedInstantiations))

    // return the metrics object:
    return {
        instantiations,
        unusedConcreteConcepts
    }
}

