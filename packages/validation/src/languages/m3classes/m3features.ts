/**
 * Functions to recursively get classifier features
 */
import { visitAndMap } from "../../util/graphs.js"
import { M3Annotation, M3Classifier, M3Concept, M3Containment, M3Interface, M3Property, M3Reference } from "./m3.js"

/**
 * Returns all direct super concepts, annotations and implemented interfaces of `classifier`
 * @param classifier
 */
export function superClassifiers(classifier: M3Classifier): M3Classifier[]{
    const result: M3Classifier[] = []

    if (classifier instanceof M3Concept) {
        if (classifier.extends !== null) {
            result.push(classifier.extends as M3Concept)
        }
        result.push(...classifier.implements)
    } else if (classifier instanceof M3Annotation) {
        if (classifier.extends !== null) {
            result.push(classifier.extends as M3Annotation)
        }
        result.push(...classifier.implements)
    } else if (classifier instanceof M3Interface) {
        result.push(...classifier.extends)
    } else {
        throw new Error(`concept type ${typeof classifier} not handled`)
    }
    return result
}

/**
 * Returns all super concepts, annotations and implemented interfaces of `classifier` recursively.
 * @param classifier
 */
export function allSuperClassifiers(classifier: M3Classifier): M3Classifier[] {
    return visitAndMap(superClassifiers, superClassifiers)(classifier)
}

/**
 * Returns all properties defined by `classifier`, **not** looking at super classifiers or implemented interfaces.
 * @param classifier
 */
export function propertyDefinitions(classifier: M3Classifier): M3Property[]  {
    return classifier.m3properties
}

/**
 * Returns all properties defined by `classifier`, **including** properties of super classifiers and implemented interfaces.
 * @param classifier
 */
export function allPropertyDefinitions(classifier: M3Classifier): M3Property[] {
    return visitAndMap(propertyDefinitions, superClassifiers)(classifier)
}

/**
 * Returns all references defined by `classifier`, **not** looking at super classifiers or implemented interfaces.
 * @param classifier
 */
export function referenceDefinitions(classifier: M3Classifier): M3Reference[] {
    return classifier.m3references
}

/**
 * Returns all references defined by `classifier`, **including** references of super classifiers and implemented interfaces.
 * @param classifier
 */
export function allReferenceDefinitions(classifier: M3Classifier): M3Reference[] {
    return visitAndMap(referenceDefinitions, superClassifiers)(classifier)
}

/**
 * Returns all containments defined by `classifier`, **not** looking at super classifiers or implemented interfaces.
 * @param classifier
 */
export function containmentDefinitions(classifier: M3Classifier): M3Containment[] {
    return classifier.m3containments
}

/**
 * Returns all containments defined by `classifier`, **including** containments of super classifiers and implemented interfaces.
 * @param classifier
 */
export function allContainmentDefinitions(classifier: M3Classifier): M3Containment[] {
    return visitAndMap(containmentDefinitions, superClassifiers)(classifier)
}
