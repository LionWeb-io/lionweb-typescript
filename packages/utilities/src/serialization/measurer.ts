import {
    conceptsOf,
    groupBy,
    Language,
    mapValues,
    MemoisingSymbolTable,
    MetaPointer,
    SerializationChunk
} from "@lionweb/core"
import { Metrics } from "./metric-types.js"


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
    const instantiationsPerMetaPointer = groupBy(serializationChunk.nodes, ({ classifier }) => metaPointerAsText(classifier))

    // map grouped nodes to instantiations with count:
    const instantiations = Object.values(instantiationsPerMetaPointer).map((nodes) => {
        const classifier = nodes[0].classifier
        const language = symbolTable.languageMatching(classifier.language, classifier.version)
        return {
            language: {
                key: classifier.language,
                version: classifier.version,
                name: language?.name
            },
            key: classifier.key,
            name: symbolTable.entityMatching(nodes[0].classifier)?.name,
            instantiations: nodes.length
        }
    })

    // compute all concrete concepts for the language:
    const concreteConcepts = languages.flatMap(conceptsOf).filter((concept) => !concept.abstract)
    const unusedConcreteConcepts = concreteConcepts
        .map((concept) => concept.metaPointer())
        .filter((metaPointer) => !(metaPointerAsText(metaPointer) in instantiationsPerMetaPointer))
        .map((metaPointer) => ({
            language: {
                key: metaPointer.language,
                version: metaPointer.version,
                name: symbolTable.languageMatching(metaPointer.language, metaPointer.version)?.name
            },
            key: metaPointer.key,
            name: symbolTable.entityMatching(metaPointer)?.name
        }))

    const languageKey2version2instantiations =
        mapValues(
            groupBy(serializationChunk.nodes, ({ classifier }) => classifier.language),
            (nodes) => mapValues(
                groupBy(nodes, ({ classifier  }) => classifier.version),
                (nodes) => nodes.length
            )
        )
    const usedLanguages = Object.entries(languageKey2version2instantiations)
        .flatMap(([key, version2Count]) =>
            Object.entries(version2Count)
                .map(([version, instantiations]) => ({
                    key,
                    version,
                    name: symbolTable.languageMatching(key, version)?.name,
                    instantiations
                }))
        )

    // return the metrics object:
    return {
        usedLanguages,
        instantiations,
        unusedConcreteConcepts
    }
}

