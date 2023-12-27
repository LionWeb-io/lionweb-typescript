import {Language, LanguageEntity} from "./m3/index.js"
import {MetaPointer} from "./serialization.js"


/**
 * Interface for objects that can look up within languages, based on given {@link MetaPointer meta pointers}.
 * This is meant to be able to properly encapsulate performance optimizations, also outside of the context
 * of deserialization.
 */
interface ISymbolTable {
    /**
     *
     * Looks up the {@link LanguageEntity} pointed to by the given {@link MetaPointer},
     * or {@code undefined} if it couldn't be found.
     */
    entityMatching(entityMetaPointer: MetaPointer): LanguageEntity | undefined
    // featureMatching(entityMetaPointer: MetaPointer, featureMetaPointer: MetaPointer): Feature | undefined
}

/**
 * Naïve, non-performant implementation of {@link ISymbolTable}.
 */
class NaiveSymbolTable implements ISymbolTable {

    private readonly languages: Language[]

    constructor(languages: Language[]) {
        this.languages = languages
    }

    private languageMatching(metaPointer: MetaPointer): Language | undefined {
        return this.languages.find((language) =>
               language.key === metaPointer.language
            && language.version === metaPointer.version
        )
    }

    entityMatching(entityMetaPointer: MetaPointer): LanguageEntity | undefined {
        return this.languageMatching(entityMetaPointer)
            ?.entities
            .find((entity) => entity.key === entityMetaPointer.key)
    }

    /*
    featureMatching(classifierMetaPointer: MetaPointer, featureMetaPointer: MetaPointer): Feature | undefined {
        const classifier = this.entityMatching(classifierMetaPointer)
        if (classifier === undefined || !(classifier instanceof Classifier)) {
            return undefined
        }
        const allFeatures = allFeaturesOf(classifier)
        return allFeatures.find((feature) => feature.key === featureMetaPointer.key)
    }
     */
}


export type {
    ISymbolTable
}

export {
    NaiveSymbolTable
}

