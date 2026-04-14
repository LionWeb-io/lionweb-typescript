import { ClassifierPointer, LanguagePointer, Metrics } from "./types.js"

/**
 * A “0” instance of the {@link Metrics metrics type},
 * for use in combination with `Array.reduce`:
 * ```reduce(mergeMetrics, zeroMetrics)```.
 */
export const zeroMetrics: Metrics = {
    languagesWithInstantiations: [],
    instantiatedClassifiers: [],
    languagesWithoutInstantiations: [],
    uninstantiatedInstantiableClassifiers: []
}


const isFromSameLanguage = (that: LanguagePointer) =>
    (other: LanguagePointer) =>
        that.key === other.key && that.version === other.version

const isFromSameClassifier = (that: ClassifierPointer) =>
    (other: ClassifierPointer) =>
        isFromSameLanguage(that.language)(other.language) && that.key === other.key


/**
 * @return a merging of the given `left` and `right` {@link Metrics metrics}.
 */
export const mergeMetrics = (left: Metrics, right: Metrics): Metrics => {
    const languagesWithInstantiations = [
        ...(
            left.languagesWithInstantiations.map((leftMetric) => {
                const rightMetric = right.languagesWithInstantiations.find(isFromSameLanguage(leftMetric))
                return {
                    key: leftMetric.key,
                    version: leftMetric.version,
                    name: leftMetric.name ?? rightMetric?.name,
                    instantiations: leftMetric.instantiations + (rightMetric?.instantiations ?? 0)
                }
            })
        ),
        ...(
            right.languagesWithInstantiations.filter((rightMetric) =>
                !left.languagesWithInstantiations.some(isFromSameLanguage(rightMetric))
            )
        )
    ]

    const instantiatedClassifiers = [
        ...(
            left.instantiatedClassifiers.map((leftMetric) => {
                const rightMetric = right.instantiatedClassifiers.find(isFromSameClassifier(leftMetric))
                return {
                    language: leftMetric.language,
                    key: leftMetric.key,
                    name: leftMetric.name ?? rightMetric?.name,
                    metaType: leftMetric.metaType,
                    instantiations: leftMetric.instantiations + (rightMetric?.instantiations ?? 0)
                }
            })
        ),
        ...(
            right.instantiatedClassifiers.filter((rightMetric) =>
                !left.instantiatedClassifiers.some(isFromSameClassifier(rightMetric))
            )
        )
    ]

    const languagesWithoutInstantiations = [...left.languagesWithoutInstantiations, ...right.languagesWithoutInstantiations]
        .filter((languagePointer, index, all) =>
               !languagesWithInstantiations.some(isFromSameLanguage(languagePointer))   // remove languages that have instantiations after all
            && !all.slice(0, index).some(isFromSameLanguage(languagePointer))     // remove languages that already occurred
        )

    const uninstantiatedInstantiableClassifiers = [...left.uninstantiatedInstantiableClassifiers, ...right.uninstantiatedInstantiableClassifiers]
        .filter((classifierPointer, index, all) =>
               !instantiatedClassifiers.some(isFromSameClassifier(classifierPointer))     // remove languages that have instantiations after all
            && !all.slice(0, index).some(isFromSameClassifier(classifierPointer))   // remove languages that already occurred
        )

    return {
        languagesWithInstantiations,
        instantiatedClassifiers,
        languagesWithoutInstantiations,
        uninstantiatedInstantiableClassifiers
    }
}


/**
 * @return the aggregation of all given {@link Metric `metrics`}.
 */
export const aggregateMetrics = (metrics: Metrics[]): Metrics =>
    metrics.reduce(mergeMetrics, zeroMetrics)

