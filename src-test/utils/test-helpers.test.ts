import {assert} from "chai"
const {deepEqual, throws} = assert


describe("test helpers", () => {

    it("undefined values thwart deepEqual", () => {
        throws(() => {
            deepEqual({ foo: undefined }, {})
        },
            `expected { foo: undefined } to deeply equal {}`
        )
    })

})

