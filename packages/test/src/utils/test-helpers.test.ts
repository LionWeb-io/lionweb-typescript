import { deepEqual, throws } from "../utils/assertions.js"

describe("test helpers", () => {
    it("undefined values thwart deepEqual", () => {
        throws(() => {
            deepEqual({ foo: undefined }, {})
        }, `expected { foo: undefined } to deeply equal {}`)
    })
})
