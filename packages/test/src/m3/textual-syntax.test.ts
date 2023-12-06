import {assert} from "chai"
const {equal} = assert

import {asText} from "@lionweb/utilities"

import {languageWithEnum} from "../languages/with-enum.js"


describe("textual syntax (LionCore)", () => {

    it("print out language with an enum as text", () => {
        equal(
            asText(languageWithEnum),
`language WithEnum
    version: 1
    entities (↓name):

        concept EnumHolder
            features (↓name):
                enumValue: MyEnum

        enumeration MyEnum
            literals:
                lit1
                lit2

`
        )
    })

})

