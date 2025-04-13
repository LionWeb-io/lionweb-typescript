import { LionWebJsonMetaPointer, LionWebKey } from "@lionweb/json"
import { allFeaturesOf } from "./m3/functions.js"
import { Classifier, Feature, Language, LanguageEntity } from "./m3/types.js"


/**
 * Interface for objects that can look up within languages, based on given {@link LionWebJsonMetaPointer meta pointers}.
 * This is meant to be able to properly encapsulate performance optimizations, also outside of the context
 * of deserialization.
 */
interface SymbolTable {

    /**
     * Looks up the {@link Language}, as pointed to by the given language key and version.
     */
    languageMatching(key: LionWebKey, version: string): Language | undefined

    /**
     * Looks up the {@link LanguageEntity}, as pointed to by the given {@link LionWebJsonMetaPointer},
     * or {@code undefined} if it couldn't be found.
     */
    entityMatching(entityMetaPointer: LionWebJsonMetaPointer): LanguageEntity | undefined

    /**
     * Looks up the {@link Feature}, as pointed to by the {@link LionWebJsonMetaPointer} given second,
     * as a feature of the {@link Classifier}, as pointed to by the {@link LionWebJsonMetaPointer} given first,
     * or {@code undefined} it it couldn't be found.
     * <em>Note</em> that the {@code language} and {@code version} values of both {@link LionWebJsonMetaPointer}-typed arguments should coincide,
     * although this is typically not checked!
     */
    featureMatching(entityMetaPointer: LionWebJsonMetaPointer, featureMetaPointer: LionWebJsonMetaPointer): Feature | undefined

}


/**
 * Naive, non-performant implementation of {@link SymbolTable}.
 */
class NaiveSymbolTable implements SymbolTable {

    private readonly languages: Language[]

    constructor(languages: Language[]) {
        this.languages = languages
    }

    languageMatching(key: LionWebKey, version: string): Language | undefined {
        return this.languages.find((language) =>
               language.key === key
            && language.version === version
        )
    }

    entityMatching(entityMetaPointer: LionWebJsonMetaPointer): LanguageEntity | undefined {
        return this.languageMatching(entityMetaPointer.language, entityMetaPointer.version)
            ?.entities
            .find((entity) => entity.key === entityMetaPointer.key)
    }

    featureMatching(classifierMetaPointer: LionWebJsonMetaPointer, featureMetaPointer: LionWebJsonMetaPointer): Feature | undefined {
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
    allFeatures: Feature[]                                      // === [] if entity is not a Classifier
    featureKey2feature: { [featureKey: LionWebKey]: Feature }   // populated through memoisation
}

class MemoisingSymbolTable implements SymbolTable {

    private readonly languages: Language[]

    constructor(languages: Language[]) {
        this.languages = languages
    }

    private readonly languageKey2version2language: { [languageKey: LionWebKey]: { [version: string]: Language } } = {}

    languageMatching(languageKey: LionWebKey, version: string): Language | undefined {
        return lazyMapGet(
            lazyMapGet(this.languageKey2version2language, languageKey, () => ({})),
            version,
            () => this.languages.find((language) =>
                   language.key === languageKey
                && language.version === version
            )
        )
    }


    private readonly languageKey2version2entityKey2entityInfo: { [languageKey: LionWebKey]: { [version: string]: { [entityKey: LionWebKey]: (EntityInfo | undefined) } } } = {}

    private entityInfoMatching(entityMetaPointer: LionWebJsonMetaPointer): undefined | EntityInfo {
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

    entityMatching(entityMetaPointer: LionWebJsonMetaPointer): LanguageEntity | undefined {
        return this.entityInfoMatching(entityMetaPointer)?.entity
    }

    featureMatching(classifierMetaPointer: LionWebJsonMetaPointer, featureMetaPointer: LionWebJsonMetaPointer): Feature | undefined {
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

