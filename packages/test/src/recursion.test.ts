import { flatMapNonCyclingFollowing, trivialFlatMapper } from "@lionweb/core"
import { deepEqual } from "assert"

describe('Unit Test for flatMapNonCyclingFollowing Function', () => { 
    it('should return the root', () => {


        const thing = "thing"
        const flatMap = flatMapNonCyclingFollowing(trivialFlatMapper, _ => [])
        const result = flatMap(thing)

        deepEqual(result, [thing])
    })

    it('should detect not cycle indefinitely', () => {
        // Setup a simple graph
        const graph: {[node:number] : number[] }  = {
            1: [2, 3], // Node 1 connects to 2 and 3
            2: [4],    // Node 2 connects to 4
            3: [2],    // Node 3 connects to 2 (creating a cycle with 1 -> 2 -> 3 -> 2)
            4: []      // Node 4 is a leaf
        }   

        const flatMap = flatMapNonCyclingFollowing(trivialFlatMapper, (node: number) => graph[node])
        const result = flatMap(1)

        deepEqual(result, [1, 2, 4, 3])
    })
})