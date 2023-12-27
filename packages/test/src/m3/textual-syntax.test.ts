import {assert} from "chai"
const {equal} = assert

import {serializeNodes} from "@lionweb/core"
import {genericAsTreeText, languageAsText} from "@lionweb/utilities"

import {languageWithEnum} from "../languages/with-enum.js"
import {libraryExtractionFacade, libraryModel} from "../instances/library.js"
import {libraryLanguage} from "../languages/library.js";


describe("LionCore-specific textual syntax", () => {

    it("textualize language with an enum as text", () => {
        equal(
            languageAsText(languageWithEnum),
`language WithEnum
    version: 1
    entities (↓name):

        concept EnumHolder
            features (↓name):
                enumValue: MyEnum

        enumeration MyEnum
            literals:
                literal1
                literal2

`
        )
    })

})


describe("generic textual syntax", () => {

    it("textualize library model without language def.", () => {
        equal(
            genericAsTreeText(serializeNodes(libraryModel, libraryExtractionFacade)),
            `[Library] (id: jkxERSov0TuSh7MMz2D5ciLrZDrU4o_VMOpmBqh_j7E) {
    [library_Library_name] = Bob's Library
    [books]:
        [Book] (id: Q1NQ_zXwOF2Pjf1uklMTumJhQH4V1Qnfjnu0gz7Fzzs) {
            [title] = Explorer Book
            [pages] = 1337
            [type] = Special
            [author] -> 7RxOqvS1ZIdpk-ao-6Tzy1QQRxl6fp_tGMH_BIK4LzQ (Jack London)
        }
}
[GuideBookWriter] (id: 7RxOqvS1ZIdpk-ao-6Tzy1QQRxl6fp_tGMH_BIK4LzQ) {
    [countries] = Alaska
    [library_Writer_name] = Jack London
}
`
        )
    })

    it("textualize library model with language def.", () => {
        equal(
            genericAsTreeText(serializeNodes(libraryModel, libraryExtractionFacade), [libraryLanguage]),
            `Library (id: jkxERSov0TuSh7MMz2D5ciLrZDrU4o_VMOpmBqh_j7E) {
    name = 'Bob's Library'
    books:
        Book (id: Q1NQ_zXwOF2Pjf1uklMTumJhQH4V1Qnfjnu0gz7Fzzs) {
            title = 'Explorer Book'
            pages = 1337
            type = Special
            author -> 7RxOqvS1ZIdpk-ao-6Tzy1QQRxl6fp_tGMH_BIK4LzQ (Jack London)
        }
}
GuideBookWriter (id: 7RxOqvS1ZIdpk-ao-6Tzy1QQRxl6fp_tGMH_BIK4LzQ) {
    countries = 'Alaska'
    name = 'Jack London'
}
`
        )
    })

})

