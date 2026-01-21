import { Classifier, LanguageFactory, serializerWith } from "@lionweb/core"
import { concatenator } from "@lionweb/ts-utils"
import { genericAsTreeText, languageAsText } from "@lionweb/utilities"
import { readFileSync, writeFileSync } from "fs"

import { libraryModel, libraryReader } from "../instances/library.js"
import { libraryLanguage } from "../languages/library.js"
import { languageWithEnum } from "../languages/with-enum.js"
import { equal } from "../test-utils/assertions.js"


describe("LionCore-specific textual syntax", () => {
    it("textualize language with an enum as text", () => {
        const actual = languageAsText(languageWithEnum).replaceAll("\r\n", "\n") // normalize Windows EOLs
        const thisPath = "src/utilities"
        writeFileSync(`${thisPath}/languageWithEnum.actual.txt`, actual)
        equal(actual, readFileSync(`${thisPath}/languageWithEnum.expected.txt`, { encoding: "utf8" }).replaceAll("\r\n", "\n"))
    })

    it("textualize a language with unset references", () => {
        const factory = new LanguageFactory("foo", "0", concatenator("-"), concatenator("-"))
        factory.annotation("Anno")   // no .annotates
        const concept = factory.concept("Bar", false)
        factory.property(concept, "tender") // no .type
        factory.reference(concept, "lizzard")   // no .type
        equal(
            languageAsText(factory.language),
            `language foo
    version: 0
    entities (↓name):

        annotation Anno
            annotates: ???

        concept Bar
            features (↓name):
                lizzard -> ???
                tender: ???


`
        )
    })
})

describe("generic textual syntax", () => {
    it("textualize library model without language def.", () => {
        equal(
            genericAsTreeText(serializerWith({ reader: libraryReader })(libraryModel)),
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
            genericAsTreeText(serializerWith({ reader: libraryReader })(libraryModel), [libraryLanguage]),
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

    it("textualize library model with broken (incomplete) language def.", () => {
        (libraryLanguage.entities
            .filter((entity) => entity instanceof Classifier)
            .find((entity) => entity.features.length > 0)!
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .features[0] as any)["type"] = undefined
        equal(
            genericAsTreeText(serializerWith({ reader: libraryReader })(libraryModel), [libraryLanguage]),
            `Library (id: jkxERSov0TuSh7MMz2D5ciLrZDrU4o_VMOpmBqh_j7E) {
    name = 'Bob's Library'
    books:
        Book (id: Q1NQ_zXwOF2Pjf1uklMTumJhQH4V1Qnfjnu0gz7Fzzs) {
            title = ???
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
