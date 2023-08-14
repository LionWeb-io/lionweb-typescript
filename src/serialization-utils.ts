import {SerializedModel} from "./serialization.ts"


/**
 * @return a shortened version of a {@link SerializedModel JSON serialization}, which should make it easier to inspect.
 *  Note that the shortened version doesn't contain all information, and could (in theory) be malformed.
 */
export const shorten = ({nodes}: SerializedModel) =>
    nodes.map((node) => ({
        id: node.id,
        concept: node.concept.key,
        parent: node.parent,
        ...Object.fromEntries(
            [
                ...node.properties.map((serProp) => [serProp.property.key, serProp.value]),
                ...node.children.map((serContainment) => [serContainment.containment.key, serContainment.children]),
                ...node.references.map((serReference) => [serReference.reference.key, serReference.targets.map(({reference}) => reference)])
            ]
        )
    }))

