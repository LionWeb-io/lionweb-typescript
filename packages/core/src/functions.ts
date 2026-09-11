import { LionWebId, LionWebJsonMetaPointer, LionWebJsonUsedLanguage } from "@lionweb/json"
import { flatMapNonCyclingFollowing, trivialFlatMapper } from "@lionweb/ts-utils"
import { Node } from "./types.js"
import { Classifier, Feature, Language } from "./m3/index.js"


/**
 * @return a list of itself and the ancestors of the given {@link Node node}, in anti-chronological order.
 */
export const containmentChain = (node: Node): Node[] => {
    const getParent = (t: Node): Node[] => t.parent === undefined ? [] : [t.parent]
    return flatMapNonCyclingFollowing(trivialFlatMapper, getParent)(node)
}


/**
 * Maps an array of {@link Node AST nodes} to their IDs.
 */
export const asIds = (nodes: Node[]): LionWebId[] =>
    nodes.map(idOf)


/**
 * @return the id of the given {@link Node node}.
 */
export const idOf = <T extends Node>({id}: T): LionWebId =>
    id


/**
 * @return the {@link LionWebJsonMetaPointer} for the given {@link Feature}.
 */
export const metaPointerForFeature = (feature: Feature): LionWebJsonMetaPointer => {
    const { language } = feature.classifier
    return {
        language: language.key,
        version: language.version,
        key: feature.key
    }
}

/**
 * Legacy version of {@link metaPointerForFeature} that wasn’t name-distinguished from other `metaPointerFor{Classifier|Feature|Language}` yet.
 *
 * @deprecated Use {@link metaPointerForFeature} instead.
 */
export const metaPointerFor = metaPointerForFeature

/**
 * @return the {@link LionWebJsonMetaPointer} for the given {@link Classifier}.
 */
export const metaPointerForClassifier = (classifier: Classifier): LionWebJsonMetaPointer =>
    classifier.metaPointer()

/**
 * @return the {@link LionWebJsonUsedLanguage meta-pointer} for the given {@link Language}.
 */
export const metaPointerForLanguage = ({ key, version }: Language): LionWebJsonUsedLanguage => ({
        key, version
    })

