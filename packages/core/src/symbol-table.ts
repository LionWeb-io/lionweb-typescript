import {allFeaturesOf, Classifier, Feature, Language, LanguageEntity} from "./m3/index.js"
import {MetaPointer} from "./serialization.js"


/**
 * Interface for objects that can look up within languages, based on given {@link MetaPointer meta pointers}.
 * This is meant to be able to properly encapsulate performance optimizations, also outside of the context
 * of deserialization.
 */
interface SymbolTable {

    /**
     * Looks up the {@link Language}, as pointed to by the given language key and version.
     */
    languageMatching(key: string, version: string): Language | undefined

    /**
     * Looks up the {@link LanguageEntity}, as pointed to by the given {@link MetaPointer},
     * or {@code undefined} if it couldn't be found.
     */
    entityMatching(entityMetaPointer: MetaPointer): LanguageEntity | undefined

    /**
     * Looks up the {@link Feature}, as pointed to by the {@link MetaPointer} given second,
     * as a feature of the {@link Classifier}, as pointed to by the {@link MetaPointer} given first,
     * or {@code undefined} it it couldn't be found.
     * <em>Note</em> that the {@code language} and {@code version} values of both {@link MetaPointer}-typed arguments should coincide,
     * although this is typically not checked!
     */
    featureMatching(entityMetaPointer: MetaPointer, featureMetaPointer: MetaPointer): Feature | undefined

}


/**
 * Naive, non-performant implementation of {@link SymbolTable}.
 */
class NaiveSymbolTable implements SymbolTable {

    private readonly languages: Language[]

    constructor(languages: Language[]) {
        this.languages = languages
    }

    languageMatching(key: string, version: string): Language | undefined {
        return this.languages.find((language) =>
               language.key === key
            && language.version === version
        )
    }

    entityMatching(entityMetaPointer: MetaPointer): LanguageEntity | undefined {
        return this.languageMatching(entityMetaPointer.language, entityMetaPointer.version)
            ?.entities
            .find((entity) => entity.key === entityMetaPointer.key)
    }

    featureMatching(classifierMetaPointer: MetaPointer, featureMetaPointer: MetaPointer): Feature | undefined {
        const classifier = this.entityMatching(classifierMetaPointer)
        if (classifier === undefined || !(classifier instanceof Classifier)) {
            return undefined
        }
        const allFeatures = allFeaturesOf(classifier)
        return allFeatures.find((feature) => feature.key === featureMetaPointer.key)
    }

}


const lazyMapGet = <T>(map: { [key: string]: T }, key: string, createThunk: () => T): T => {
    if (key in map) {
        return map[key]
    }
    const value = createThunk()
    map[key] = value
    return value
}


type EntityInfo = {
    entity: LanguageEntity
    allFeatures: Feature[]                                  // === [] if entity is not a Classifier
    featureKey2feature: { [featureKey: string]: Feature }   // populated through memoisation
}

class MemoisingSymbolTable implements SymbolTable {

    private readonly languages: Language[]

    constructor(languages: Language[]) {
        this.languages = languages
    }

    private readonly languageKey2version2language: { [languageKey: string]: { [version: string]: Language } } = {}

    languageMatching(languageKey: string, version: string): Language | undefined {
        return lazyMapGet(
            lazyMapGet(this.languageKey2version2language, languageKey, () => ({})),
            version,
            () => this.languages.find((language) =>
                   language.key === languageKey
                && language.version === version
            )
        )
    }


    private readonly languageKey2version2entityKey2entityInfo: { [languageKey: string]: { [version: string]: { [entityKey: string]: (EntityInfo | undefined) } } } = {}

    private entityInfoMatching(entityMetaPointer: MetaPointer): undefined | EntityInfo {
        return lazyMapGet(
            lazyMapGet(
                lazyMapGet(this.languageKey2version2entityKey2entityInfo, entityMetaPointer.language, () => ({})),
                entityMetaPointer.version,
                () => ({})
            ),
            entityMetaPointer.key,
            () => {
                const entity = this.languageMatching(entityMetaPointer.language, entityMetaPointer.version)
                    ?.entities
                    .find((entity) => entity.key === entityMetaPointer.key)
                return entity && { entity, allFeatures: entity instanceof Classifier ? allFeaturesOf(entity) : [], featureKey2feature: {} }
            }
        )
    }

    entityMatching(entityMetaPointer: MetaPointer): LanguageEntity | undefined {
        return this.entityInfoMatching(entityMetaPointer)?.entity
    }

    featureMatching(classifierMetaPointer: MetaPointer, featureMetaPointer: MetaPointer): Feature | undefined {
        const entityInfo = this.entityInfoMatching(classifierMetaPointer)
        if (entityInfo === undefined || !(entityInfo.entity instanceof Classifier)) {
            return undefined
        }
        return lazyMapGet(
            entityInfo.featureKey2feature,
            featureMetaPointer.key,
            () => entityInfo.allFeatures.find((feature) => feature.key === featureMetaPointer.key)
        )
    }

}


export type {
    SymbolTable
}

export {
    MemoisingSymbolTable,
    NaiveSymbolTable
}

