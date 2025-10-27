import { flatMapNonCyclingFollowing, trivialFlatMapper } from "@lionweb/ts-utils"

import { allFeaturesOf, isContainment } from "./m3/index.js"
import { Reader } from "./reading.js"
import { Node } from "./types.js"


/**
 * Type def. for functions that extract {@link Node nodes} from a given one.
 */
export type NodesExtractor<NT extends Node> = (node: NT) => NT[]

/**
 * @return A function that extracts the children from a given node.
 */
export const childrenExtractorUsing = <NT extends Node>(reader: Reader<NT>): NodesExtractor<NT> =>
    (node: NT): NT[] => [
        ...(allFeaturesOf(reader.classifierOf(node))
            .filter(isContainment)
            .flatMap((containment) => reader.getFeatureValue(node, containment) ?? [])),
// FIXME  there's NO guarantee about the result of reader.getFeatureValue(node, containment) !!!
        ...node.annotations
    ] as NT[]


/**
 * @return a function that extracts *all* nodes from a given start node - usually a root node.
 */
export const nodesExtractorUsing = <NT extends Node>(reader: Reader<NT>): NodesExtractor<NT> =>
    flatMapNonCyclingFollowing(trivialFlatMapper, childrenExtractorUsing<NT>(reader))

