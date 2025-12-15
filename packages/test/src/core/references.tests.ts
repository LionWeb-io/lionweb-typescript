import { isReferenceToSet, referenceToSet } from "@lionweb/core"
import { deepEqual, isTrue } from "../test-utils/assertions.js"

describe("reference", () => {

    it("an unset reference is recognized", () => {
        isTrue(isReferenceToSet(referenceToSet))
        deepEqual(referenceToSet, referenceToSet)
    })

})

