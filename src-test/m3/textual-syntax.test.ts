import {assert} from "chai"
const {equal} = assert

import {asText} from "../../src-pkg/index.js"
import {languageWithEnum} from "../languages/with-enum.js"


describe("textual syntax (LIonCore)", () => {

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

