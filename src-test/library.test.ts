import {assertEquals} from "./deps.ts"
import {
    deserializeModel,
    dynamicModelAPI,
    DynamicNode,
    nameBasedConceptDeducerFor,
    serializeNodes
} from "../src/index.ts"
import {libraryModel, libraryModelApi} from "./library.ts"
import {libraryLanguage} from "./m3/library-language.ts"
import {undefinedValuesDeletedFrom} from "./utils/test-helpers.ts"


Deno.test("Library test model", async (tctx) => {

    await tctx.step("[de-]serialize example library", () => {
        const serialization = serializeNodes(libraryModel, libraryModelApi)
        const deserialization = deserializeModel(undefinedValuesDeletedFrom(serialization), libraryModelApi, libraryLanguage, [])
        assertEquals(deserialization, libraryModel)
    })

    await tctx.step(`"dynamify" example library through serialization and deserialization using the Dynamic Model API`, () => {
        const serialization = serializeNodes(libraryModel, libraryModelApi)
        const dynamification = deserializeModel(undefinedValuesDeletedFrom(serialization), dynamicModelAPI, libraryLanguage, [])

        assertEquals(dynamification.length, 2)
        const lookup = nameBasedConceptDeducerFor(libraryLanguage)
        assertEquals(dynamification[0].concept, lookup("Library"))
        assertEquals(dynamification[1].concept, lookup("GuideBookWriter"))
        const [library, writer] = dynamification
        const books = library.settings["books"] as DynamicNode[]
        assertEquals(books.length, 1)
        const book = books[0]
        assertEquals(book.concept, lookup("Book"))
        assertEquals(book.settings["author"], writer)
    })

})

