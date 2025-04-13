import { allContaineds } from "@lionweb/core"

import { metaLanguage } from "../languages/meta.js"
import { equal } from "../utils/assertions.js"

describe("meta-typed classifier deducer", () => {
    it("works for M3", () => {
        for (const thing of allContaineds(metaLanguage)) {
            equal(thing.metaType(), thing.constructor.name)
        }
    })
})
