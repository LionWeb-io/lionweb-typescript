import {assert} from "chai"
const {equal} = assert

import {asText} from "@lionweb/core"
import {languageWithEnum} from "../languages/with-enum.js"


describe("textual syntax (LionCore)", () => {

    it("print out language with an enum as text", () => {
        equal(
            asText(languageWithEnum),
`language language-with-enum
    version: 1
    entities (↓name):

        enumeration enum
            literals:
                lit1
                lit2

`
        )
    })

})

