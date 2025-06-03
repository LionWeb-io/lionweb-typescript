import { flatMapNonCyclingFollowing, trivialFlatMapper } from "@lionweb/ts-utils"

import { deepEqual } from "../test-utils/assertions.js"

describe("flatMapNonCyclingFollowing", () => {

    it("should return the root", () => {
        const thing = "thing"
        const flatMap = flatMapNonCyclingFollowing(trivialFlatMapper, _ => [])
        const result = flatMap(thing)

        deepEqual(result, [thing])
    })

    it("should detect not cycle indefinitely", () => {
        // set up a simple graph:
        const graph: { [node: number]: number[] } = {
            1: [2, 3], // node 1 connects to 2 and 3
            2: [4], // node 2 connects to 4
            3: [2], // node 3 connects to 2 (creating a cycle with 1 -> 2 -> 3 -> 2)
            4: [] // node 4 is a leaf
        }

        const flatMap = flatMapNonCyclingFollowing(trivialFlatMapper, (node: number) => graph[node])
        const result = flatMap(1)

        deepEqual(result, [1, 2, 4, 3])
    })

})

