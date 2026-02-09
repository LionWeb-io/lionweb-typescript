import { LionWebJsonMetaPointer, LionWebKey } from "@lionweb/json"
import { lazyMapGet } from "@lionweb/ts-utils"
import { allFeaturesOf } from "./functions.js"
import { Classifier, Feature, Language, LanguageEntity } from "./types.js"


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
     * or `undefined` if it couldn't be found.
     */
    entityMatching(entityMetaPointer: LionWebJsonMetaPointer): LanguageEntity | undefined

    /**
     * Looks up the {@link Feature}, as pointed to by the {@link LionWebJsonMetaPointer} given second,
     * as a feature of the {@link Classifier}, as pointed to by the {@link LionWebJsonMetaPointer} given first,
     * or `undefined` it it couldn't be found.
     * *Note* that the `language` and `version` values of both {@link LionWebJsonMetaPointer}-typed arguments should coincide,
     * although this is typically not checked!
     */
    featureMatching(entityMetaPointer: LionWebJsonMetaPointer, featureMetaPointer: LionWebJsonMetaPointer): Feature | undefined

}


type EntityInfo = {
    entity: LanguageEntity
    allFeatures: Feature[]                                      // === [] if entity is not a Classifier
    featureKey2feature: { [featureKey: LionWebKey]: Feature }   // populated through memoisation
}


/**
 * A {@link SymbolTable} implementation that *memoises* the items it has looked up.
 * This helps with performance, because otherwise lookup might be linear in the (max.) number of languages,
 * entities in a language, features in classifiers — taking inheritance into account.
 */
class MemoisingSymbolTable implements SymbolTable {

    private readonly languages: Language[]

    constructor(languages: Language[]) {
        this.languages = languages
    }

    private readonly languageKey2version2language: { [languageKey: LionWebKey]: { [version: string]: Language } } = {}

    languageMatching = (languageKey: LionWebKey, version: string): Language | undefined =>
        lazyMapGet(
            lazyMapGet(this.languageKey2version2language, languageKey, () => ({})),
            version,
            () => this.languages.find((language) =>
                   language.key === languageKey
                && language.version === version
            )
        )


    private readonly languageKey2version2entityKey2entityInfo: { [languageKey: LionWebKey]: { [version: string]: { [entityKey: LionWebKey]: (EntityInfo | undefined) } } } = {}

    private entityInfoMatching = (entityMetaPointer: LionWebJsonMetaPointer): undefined | EntityInfo =>
        lazyMapGet(
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
                return entity === undefined
                    ? undefined
                    : {
                        entity,
                        allFeatures: entity instanceof Classifier ? allFeaturesOf(entity) : [], featureKey2feature: {}
                }
            }
        )

    entityMatching = (entityMetaPointer: LionWebJsonMetaPointer): LanguageEntity | undefined =>
        this.entityInfoMatching(entityMetaPointer)?.entity

    /**
     * Looks up the {@link LanguageEntity}, as pointed to by the given {@link LionWebJsonMetaPointer},
     * and @returns all its {@link Feature features} or an empty array if it couldn't be found.
     */
    allFeaturesOfEntityMatching = (entityMetaPointer: LionWebJsonMetaPointer): Feature[] =>
        this.entityInfoMatching(entityMetaPointer)?.allFeatures ?? []

    featureMatching = (classifierMetaPointer: LionWebJsonMetaPointer, featureMetaPointer: LionWebJsonMetaPointer): Feature | undefined => {
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
    MemoisingSymbolTable
}

