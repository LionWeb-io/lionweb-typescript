import { Annotation, Concept, instantiableClassifiersOf, Interface, Language, LanguageEntity, MemoisingSymbolTable } from "@lionweb/core"
import { LionWebJsonChunk, LionWebJsonMetaPointer, LionWebJsonNode, LionWebJsonUsedLanguage } from "@lionweb/json"
import { sumNumbers } from "../utils/array.js"
import { nested3Grouper, nested3Mapper, nestedFlatMap2, nestedFlatMap3 } from "../utils/nested-map.js"
import { ClassifierMetaTypes, Metrics } from "./metric-types.js"

type Info = {
    classifier: LionWebJsonMetaPointer
    instantiations: number
}

/**
 * Computes {@link Metrics metrics} on the given {@link LionWebJsonChunk serialization chunk}.
 * Passing it {@link Language languages} make this language-aware:
 *  * language and classifier names are looked up,
 *  * unused instantiable classifiers and languages without instantiations are computed as well.
 */
export const measure = (serializationChunk: LionWebJsonChunk, languages: Language[]): Metrics => {
    const symbolTable = new MemoisingSymbolTable(languages)

    // group nodes by language key, version, and classifier key, mapped to the classifier meta-pointer and #instantiations:
    const languageKey2version2classifierKey2info = nested3Mapper<LionWebJsonNode[], Info>(nodes => ({
        classifier: nodes[0].classifier,
        instantiations: nodes.length
    }))(
        nested3Grouper<LionWebJsonNode>(
            ({ classifier }) => classifier.language,
            ({ classifier }) => classifier.version,
            ({ classifier }) => classifier.key
        )(serializationChunk.nodes)
    )

    const languagesWithInstantiations = nestedFlatMap2(
        languageKey2version2classifierKey2info,
        (classifierKey2info, languageKey, version) => ({
            key: languageKey,
            version,
            name: symbolTable.languageMatching(languageKey, version)?.name,
            instantiations: sumNumbers(Object.values(classifierKey2info).map(info => info.instantiations))
        })
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
    const instantiatedClassifiers = nestedFlatMap3(languageKey2version2classifierKey2info, (info, languageKey, version, classifierKey) => {
        const classifier = symbolTable.entityMatching(info.classifier)
        return {
            language: {
                key: languageKey,
                version,
                name: symbolTable.languageMatching(languageKey, version)?.name
            },
            key: classifierKey,
            name: classifier?.name,
            metaType: metaTypeOf(classifier),
            instantiations: info.instantiations
        }
    })

    const doesLanguageHaveInstantiations = (language: LionWebJsonUsedLanguage): boolean =>
        language.key in languageKey2version2classifierKey2info && language.version in languageKey2version2classifierKey2info[language.key]

    const languagesWithoutInstantiations = serializationChunk.languages
        .filter(language => !doesLanguageHaveInstantiations(language))
        .map(language => ({
            ...language,
            name: symbolTable.languageMatching(language.key, language.version)?.name
        }))

    const isClassifierUsed = (metaPointer: LionWebJsonMetaPointer): boolean =>
        metaPointer.language in languageKey2version2classifierKey2info &&
        metaPointer.version in languageKey2version2classifierKey2info[metaPointer.language] &&
        metaPointer.key in languageKey2version2classifierKey2info[metaPointer.language][metaPointer.version]

    const uninstantiatedInstantiableClassifiers = languages
        .flatMap(instantiableClassifiersOf)
        .map(classifier => classifier.metaPointer())
        .filter(metaPointer => !isClassifierUsed(metaPointer))
        .map(metaPointer => ({
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
