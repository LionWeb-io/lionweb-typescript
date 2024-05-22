import {assert} from "chai"
const {equal} = assert
import {sumNumbers} from "@lionweb/utilities/dist/utils/array.js"

describe("array utils work", () => {

    it("sum numbers", () => {
        equal(sumNumbers([]), 0)
        equal(sumNumbers([1]), 1)
        equal(sumNumbers([1, 2, 3]), 6)
    })

})

