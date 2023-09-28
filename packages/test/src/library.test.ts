import {assert} from "chai"
const {deepEqual} = assert

import {
    deserializeChunk,
    DynamicNode,
    dynamicWriteModelAPI,
    nameBasedConceptDeducerFor,
    serializeNodes
} from "@lionweb/core"
import {libraryModel, libraryReadModelAPI, libraryWriteModelAPI} from "./instances/library.js"
import {libraryLanguage} from "./languages/library.js"


describe("Library test model", () => {

    it("[de-]serialize example library", () => {
        const serialization = serializeNodes(libraryModel, libraryReadModelAPI)
        // FIXME  ensure that serialization does not produce key-value pairs with value === undefined
        const deserialization = deserializeChunk(serialization, libraryWriteModelAPI, [libraryLanguage], [])
        deepEqual(deserialization, libraryModel)
    })

    it(`"dynamify" example library through serialization and deserialization using the Dynamic Model API`, () => {
        const serialization = serializeNodes(libraryModel, libraryReadModelAPI)
        const dynamification = deserializeChunk(serialization, dynamicWriteModelAPI, [libraryLanguage], [])
        deepEqual(dynamification.length, 2)
        const lookup = nameBasedConceptDeducerFor(libraryLanguage)
        deepEqual(dynamification[0].concept, lookup("Library"))
        deepEqual(dynamification[1].concept, lookup("GuideBookWriter"))
        const [library, writer] = dynamification
        const books = library.settings["books"] as DynamicNode[]
        deepEqual(books.length, 1)
        const book = books[0]
        deepEqual(book.concept, lookup("Book"))
        deepEqual(book.settings["author"], writer)
    })

})

