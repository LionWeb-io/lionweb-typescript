import {assert} from "chai"
const {deepEqual, throws} = assert

import {undefinedValuesDeletedFrom} from "./test-helpers.js"


describe("test helpers", () => {

    it("undefinedValuesDeletedFrom is needed", () => {
        throws(() => {
            deepEqual({ foo: undefined }, {})
        },
            `expected { foo: undefined } to deeply equal {}`
        )
    })

   it("undefinedValuesDeletedFrom works", () => {
        deepEqual(undefinedValuesDeletedFrom({ foo: undefined }), {} as unknown)
    })

    it("undefinedValuesDeletedFrom leaves null alone (and doesn't fail on it)", () => {
        const object = { foo: null }
        deepEqual(undefinedValuesDeletedFrom(object), object)
    })

})

