import {assert} from "chai"
const {deepEqual} = assert

import {
    deserializeSerializationChunk,
    DynamicNode,
    dynamicInstantiationFacade,
    nameBasedClassifierDeducerFor,
    serializeNodes, DefaultPrimitiveTypeDeserializer
} from "@lionweb/core"
import {libraryModel, libraryExtractionFacade, libraryInstantiationFacade} from "./instances/library.js"
import {libraryLanguage} from "./languages/library.js"


describe("Library test model", () => {

    it("[de-]serialize example library", () => {
        const serializationChunk = serializeNodes(libraryModel, libraryExtractionFacade)
        // FIXME  ensure that serialization does not produce key-value pairs with value === undefined
        const deserialization = deserializeSerializationChunk(serializationChunk, libraryInstantiationFacade,
                            new DefaultPrimitiveTypeDeserializer(),
            [libraryLanguage], [])
        deepEqual(deserialization, libraryModel)
    })

    it(`"dynamify" example library through serialization and deserialization using the DynamicNode facades`, () => {
        const serializationChunk = serializeNodes(libraryModel, libraryExtractionFacade)
        const dynamification = deserializeSerializationChunk(serializationChunk, dynamicInstantiationFacade,
            [libraryLanguage], [])
        deepEqual(dynamification.length, 2)
        const lookup = nameBasedClassifierDeducerFor(libraryLanguage)
        deepEqual(dynamification[0].classifier, lookup("Library"))
        deepEqual(dynamification[1].classifier, lookup("GuideBookWriter"))
        const [library, writer] = dynamification
        const books = library.settings["books"] as DynamicNode[]
        deepEqual(books.length, 1)
        const book = books[0]
        deepEqual(book.classifier, lookup("Book"))
        deepEqual(book.settings["author"], writer)
    })

})

