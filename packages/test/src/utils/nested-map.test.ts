import { sumNumbers } from "@lionweb/utilities/dist/utils/array.js"
import {
    flatMapValues,
    grouper,
    mapValuesMapper,
    nested2Grouper,
    nested2Mapper,
    nested3Grouper,
    nested3Mapper,
    nestedFlatMap2,
    nestedFlatMap3
} from "@lionweb/utilities/dist/utils/nested-map.js"

import { deepEqual } from "../utils/assertions.js"

describe("nested map utils work", () => {
    it("mapValuesMapper", () => {
        deepEqual(mapValuesMapper((num: number) => num + 1)({ x: 0, y: 1 }), {
            x: 1,
            y: 2
        })
    })

    it("2-nested mapper", () => {
        deepEqual(nested2Mapper((num: number) => num + 1)({ x: { a: 0, b: 1 }, y: { c: 2 } }), {
            x: { a: 1, b: 2 },
            y: { c: 3 }
        })
    })

    it("3-nested mapper", () => {
        deepEqual(
            nested3Mapper((num: number) => num + 1)({
                x: {
                    a: { i: 0 },
                    b: { j: 1 }
                },
                y: {
                    c: { k: 2 }
                }
            }),
            {
                x: {
                    a: { i: 1 },
                    b: { j: 2 }
                },
                y: {
                    c: { k: 3 }
                }
            }
        )
    })

    const fragmentAt = (index: number) => (str: string) => str.split(":")[index]

    it("grouping mapper", () => {
        const g = grouper((str: string) => str)
        deepEqual(g([]), {})
        deepEqual(g(["x", "y", "x"]), { x: ["x", "x"], y: ["y"] })
    })

    it("2-nested grouper", () => {
        const n2g = nested2Grouper(fragmentAt(0), fragmentAt(1))
        deepEqual(n2g([]), {})
        deepEqual(n2g(["x:x", "y:x", "x:x", "x:y"]), { x: { x: ["x:x", "x:x"], y: ["x:y"] }, y: { x: ["y:x"] } })
    })

    it("3-nested grouper", () => {
        const n3g = nested3Grouper(fragmentAt(0), fragmentAt(1), fragmentAt(2))
        deepEqual(n3g([]), {})
        deepEqual(n3g(["x:x:x", "y:x:x", "x:x:x", "x:y:x", "y:x:y", "x:x:y"]), {
            x: {
                x: { x: ["x:x:x", "x:x:x"], y: ["x:x:y"] },
                y: { x: ["x:y:x"] }
            },
            y: {
                x: { x: ["y:x:x"], y: ["y:x:y"] }
            }
        })
    })

    it("flatMapValues", () => {
        deepEqual(
            flatMapValues({ x: [0, 1], y: [2, 3] }, (nums, key1) => `${key1}:${sumNumbers(nums)}`),
            ["x:1", "y:5"]
        )
    })

    it("nestedFlatMap2", () => {
        deepEqual(
            nestedFlatMap2({ x: { y: [0, 1], z: [2] }, a: { b: [3, 4] } }, (nums, key1, key2) => `${key1}:${key2}:${sumNumbers(nums)}`),
            ["x:y:1", "x:z:2", "a:b:7"]
        )
    })

    it("nestedFlatMap3", () => {
        deepEqual(
            nestedFlatMap3({ x: { y: { z: [1] } } }, (nums, key1, key2, key3) => `${key1}:${key2}:${key3}:${sumNumbers(nums)}`),
            ["x:y:z:1"]
        )
    })
})
