import {
    deserializeLanguages,
    deserializerWith,
    DynamicNode,
    dynamicWriter,
    lioncoreBuiltinsFacade,
    nameBasedClassifierDeducerFor,
    serializeLanguages,
    serializerWith
} from "@lionweb/core"

import { libraryModel, libraryReader, libraryWriter } from "../instances/library.js"
import { libraryLanguage } from "../languages/library.js"
import { deepEqual } from "../test-utils/assertions.js"


describe("Library test model", () => {
    it("[de-]serialize example library", () => {
        const serializationChunk = serializerWith({ reader: libraryReader })(libraryModel)
        // FIXME  ensure that serialization does not produce key-value pairs with value === undefined
        const deserialization = deserializerWith({ writer: libraryWriter, languages: [libraryLanguage] })(serializationChunk)
        deepEqual(deserialization, libraryModel)
    })

    it(`"dynamify" example library through serialization and deserialization using the DynamicNode facades`, () => {
        const serializationChunk = serializerWith({ reader: libraryReader })(libraryModel)
        const dynamification = deserializerWith({ writer: dynamicWriter, languages: [libraryLanguage] })(serializationChunk)
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

describe("Library test metamodel", () => {
    it("LionCore built-in primitive types are implicit", () => {
        libraryLanguage.dependingOn(lioncoreBuiltinsFacade.language)
        deepEqual(libraryLanguage.dependsOn, [])
    })

    it("serialize it", () => {
        const serialization = serializeLanguages(libraryLanguage)
        const deserialization = deserializeLanguages(serialization)
        deepEqual(deserialization.length, 1)
        deepEqual(deserialization[0], libraryLanguage)
    })
})

