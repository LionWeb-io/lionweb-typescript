import {assert} from "chai"
const {equal} = assert

import {allContaineds} from "@lionweb/core"
import {metaLanguage} from "../languages/meta.js"


describe("meta-typed classifier deducer" , () => {
    it("works for M3", () => {
        for (const thing of allContaineds(metaLanguage)) {
            equal(thing.metaType(), thing.constructor.name)
        }
    })
})

