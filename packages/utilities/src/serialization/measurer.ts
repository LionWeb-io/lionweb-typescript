import {
    Annotation,
    Concept,
    groupBy,
    instantiableClassifiersOf,
    Interface,
    Language,
    LanguageEntity,
    mapValues,
    MemoisingSymbolTable,
    MetaPointer,
    SerializationChunk,
    SerializedLanguageReference
} from "@lionweb/core"
import { ClassifierMetaTypes, Metrics } from "./metric-types.js"


/**
 * Sum the given array of numbers.
 */
const sumNumbers = (nums: number[]): number =>
    nums.reduce((acc, cur) => acc + cur, 0)


/**
 * Computes {@link Metrics metrics} on the given {@link SerializationChunk serializationChunk}.
 * Passing it {@link Language languages} make this language-aware:
 *  * language and classifier names are looked up,
 *  * unused instantiable classifiers and languages without instantiations are computed as well.
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


    const languagesWithInstantiations =
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


    const metaTypeOf = (entity?: LanguageEntity): ClassifierMetaTypes | undefined => {
        if (entity instanceof Annotation) {
            return "annotation"
        }
        if (entity instanceof Concept) {
            return "concept"
        }
        if (entity instanceof Interface) {
            return "interface"
        }
        return undefined
    }

    // map grouped nodes to info including #instantiations:
    const instantiatedClassifiers =
        Object.entries(languageKey2version2classifierKey2info)
            .flatMap(([languageKey, version2classifierKey2info]) =>
                Object.entries(version2classifierKey2info)
                    .flatMap(([version, classifierKey2info]) =>
                        Object.entries(classifierKey2info)
                            .map(([classifierKey, info]) =>{
                                const classifier = symbolTable.entityMatching(info.classifier)
                                return ({
                                    language: {
                                        key: languageKey,
                                        version,
                                        name: symbolTable.languageMatching(languageKey, version)?.name
                                    },
                                    key: classifierKey,
                                    name: classifier?.name,
                                    metaType: metaTypeOf(classifier),
                                    instantiations: info.instantiations
                                })
                            })
                    )
            )


    const doesLanguageHaveInstantiations = (language: SerializedLanguageReference): boolean =>
           language.key in languageKey2version2classifierKey2info
        && language.version in languageKey2version2classifierKey2info[language.key]

    const languagesWithoutInstantiations =
        serializationChunk.languages
            .filter((language) => !doesLanguageHaveInstantiations(language))
            .map((language) => ({
                ...language,
                name: symbolTable.languageMatching(language.key, language.version)?.name
            }))


    const isClassifierUsed = (metaPointer: MetaPointer): boolean =>
        metaPointer.language in languageKey2version2classifierKey2info
        && metaPointer.version in languageKey2version2classifierKey2info[metaPointer.language]
        && metaPointer.key in languageKey2version2classifierKey2info[metaPointer.language][metaPointer.version]

    const uninstantiatedInstantiableClassifiers =
        languages.flatMap(instantiableClassifiersOf)
            .map((classifier) => classifier.metaPointer())
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


    return {
        languagesWithInstantiations,
        instantiatedClassifiers,
        languagesWithoutInstantiations,
        uninstantiatedInstantiableClassifiers
    }
}

