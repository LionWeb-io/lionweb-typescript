import { Concept } from "@lionweb/core"
import { INodeBase } from "./base-types.js"

/**
 * @return whether the given {@link INodeBase node} is a partition itself,
 * or (in-/)directly contained by a partition.
 */
export const isContainedByAPartition = ({ classifier, parent }: INodeBase): boolean =>
       (classifier instanceof Concept && classifier.partition)
    || (parent !== undefined && isContainedByAPartition(parent));

