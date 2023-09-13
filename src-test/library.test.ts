import {assert} from "chai"
const {deepEqual} = assert

import {
    deserializeModel,
    dynamicModelAPI,
    DynamicNode,
    nameBasedConceptDeducerFor,
    serializeNodes
} from "../src-pkg/index.js"
import {libraryModel, libraryModelApi} from "./library.js"
import {libraryLanguage} from "./m3/library-language.js"
import {undefinedValuesDeletedFrom} from "./utils/test-helpers.js"


describe("Library test model", () => {

    it("[de-]serialize example library", () => {
        const serialization = serializeNodes(libraryModel, libraryModelApi)
        const deserialization = deserializeModel(undefinedValuesDeletedFrom(serialization), libraryModelApi, libraryLanguage, [])
        deepEqual(deserialization, libraryModel)
    })

    it(`"dynamify" example library through serialization and deserialization using the Dynamic Model API`, () => {
        const serialization = serializeNodes(libraryModel, libraryModelApi)
        const dynamification = deserializeModel(undefinedValuesDeletedFrom(serialization), dynamicModelAPI, libraryLanguage, [])

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

