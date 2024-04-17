import {assert} from "chai"
const {deepEqual, equal} = assert

import {
    flatMapValues,
    groupingMapper,
    nestedFlatMap2,
    nestedFlatMap3,
    nestedGroupingMapper2,
    nestedGroupingMapper3,
    sumNumbers
} from "@lionweb/utilities/dist/serialization/fp-helpers.js"


describe.only("FP helpers w.r.t. nested maps work", () => {

    it("sum numbers", () => {
        equal(sumNumbers([]), 0)
        equal(sumNumbers([1]), 1)
        equal(sumNumbers([1, 2, 3]), 6)
    })


    const arrayLength = <T>(ts: T[]) => ts.length
    const fragmentAt = (index: number) =>
        (str: string) =>
            str.split(":")[index]

    it("grouping mapper", () => {
        const gm = groupingMapper(arrayLength, (str: string) => str)
        deepEqual(gm([]), {})
        deepEqual(gm(["x", "y", "x"]), { "x": 2, "y": 1 })
    })

    it("nested grouping mapper 2", () => {
        const ngm = nestedGroupingMapper2(arrayLength, fragmentAt(0), fragmentAt(1))
        deepEqual(ngm([]), {})
        deepEqual(
            ngm(["x:x", "y:x", "x:x", "x:y"]),
            { "x": { "x": 2, "y": 1 }, "y": { "x": 1 } }
        )
    })

    it("nested grouping mapper 3", () => {
        const ngm = nestedGroupingMapper3(arrayLength, fragmentAt(0), fragmentAt(1), fragmentAt(2))
        deepEqual(ngm([]), {})
        deepEqual(
            ngm(["x:x:x", "y:x:x", "x:x:x", "x:y:x", "y:x:y", "x:x:y"]),
            {
                "x": {
                    "x": { "x": 2, "y": 1 },
                    "y": { "x": 1 }
                },
                "y": {
                    "x": { "x": 1, "y": 1 }
                }
            }
        )
    })


    it("flatMapValues", () => {
        deepEqual(
            flatMapValues({ "x": [0, 1], "y": [2, 3] }, (key, nums) => `${key}:${sumNumbers(nums)}`),
            ["x:1", "y:5"]
        )
    })

    it("nestedFlatMap2", () => {
        deepEqual(
            nestedFlatMap2({ "x": { "y": [0, 1], "z": [2] }, "a": { "b": [3, 4] } }, (key1, key2, nums) => `${key1}:${key2}:${sumNumbers(nums)}`),
            ["x:y:1", "x:z:2", "a:b:7"]
        )
    })

    it("nestedFlatMap3", () => {
        deepEqual(
            nestedFlatMap3({ "x": { "y": { "z": [1] } } }, (key1, key2, key3, nums) => `${key1}:${key2}:${key3}:${sumNumbers(nums)}`),
            ["x:y:z:1"]
        )
    })

})

