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
 * Sum the given array of numbers.
 */
const sumNumbers = (nums: number[]): number =>
    nums.reduce((acc, cur) => acc + cur, 0)


/**
 * Computes {@link Metrics metrics} on the given {@link SerializationChunk serializationChunk}.
 * Passing it {@link Language languages} make this language-aware:
 *  * classifier names are looked up,
 *  * unused concrete concepts are computed as well.
 */
export const measure = (serializationChunk: SerializationChunk, languages: Language[]): Metrics => {
    const symbolTable = new MemoisingSymbolTable(languages)

    // group nodes by language key, version, and classifier key, mapped to the classifier meta-pointer and #instantiations:
    const languageKey2version2classifierKey2info =
        mapValues(
            groupBy(serializationChunk.nodes, ({ classifier }) => classifier.language),
            (nodes) => mapValues(
                groupBy(nodes, ({ classifier }) => classifier.version),
                (nodes) => mapValues(
                    groupBy(nodes, ({ classifier }) => classifier.key),
                    (nodes) => ({ classifier: nodes[0].classifier, instantiations: nodes.length })
                )
            )
        )

    // map grouped nodes to info including #instantiations:
    const instantiations =
        Object.entries(languageKey2version2classifierKey2info)
            .flatMap(([languageKey, version2classifierKey2info]) =>
                Object.entries(version2classifierKey2info)
                    .flatMap(([version, classifierKey2info]) =>
                        Object.entries(classifierKey2info)
                            .map(([classifierKey, info]) => ({
                                language: {
                                    key: languageKey,
                                    version,
                                    name: symbolTable.languageMatching(languageKey, version)?.name
                                },
                                key: classifierKey,
                                name: symbolTable.entityMatching(info.classifier)?.name,
                                instantiations: info.instantiations
                            }))
                    )
            )

    const isClassifierUsed = (metaPointer: MetaPointer): boolean =>
           metaPointer.language in languageKey2version2classifierKey2info
        && metaPointer.version in languageKey2version2classifierKey2info[metaPointer.language]
        && metaPointer.key in languageKey2version2classifierKey2info[metaPointer.language][metaPointer.version]

    const concreteConcepts = languages.flatMap(conceptsOf).filter((concept) => !concept.abstract)

    const unusedConcreteConcepts =
        concreteConcepts
            .map((concept) => concept.metaPointer())
            .filter((metaPointer) => !isClassifierUsed(metaPointer))
            .map((metaPointer) => ({
                language: {
                    key: metaPointer.language,
                    version: metaPointer.version,
                    name: symbolTable.languageMatching(metaPointer.language, metaPointer.version)?.name
                },
                key: metaPointer.key,
                name: symbolTable.entityMatching(metaPointer)?.name
            }))

    const usedLanguages =
        Object.entries(languageKey2version2classifierKey2info)
            .flatMap(([languageKey, version2classifierKey2info]) =>
                Object.entries(version2classifierKey2info)
                    .flatMap(([version, classifierKey2info]) => ({
                        key: languageKey,
                        version,
                        name: symbolTable.languageMatching(languageKey, version)?.name,
                        instantiations: sumNumbers(Object.values(classifierKey2info).map((info) => info.instantiations))
                    }))
            )

    return {
        usedLanguages,
        instantiations,
        unusedConcreteConcepts
    }
}

