import {assertEquals} from "./deps.ts"
import {writeJsonAsFile} from "./utils/json.ts"
import {undefinedValuesDeletedFrom} from "./m3/test-helpers.ts"
import {serializeModel} from "../src/serializer.ts"
import {deserializeModel} from "../src/deserializer.ts"
import {dynamicModelAPI, DynamicNode} from "../src/dynamic-api.ts"
import {nameBasedConceptDeducerFor} from "../src/m3/functions.ts"
import {libraryModel, libraryModelApi} from "./library.ts"
import {libraryMetamodel} from "./m3/library-meta.ts"


Deno.test("Library test model", async (tctx) => {

    await tctx.step("[de-]serialize example library", async () => {
        const serialization = serializeModel(libraryModel, libraryModelApi)
        await writeJsonAsFile("models/instance/library.json", serialization)
        const deserialization = deserializeModel(undefinedValuesDeletedFrom(serialization), libraryModelApi, libraryMetamodel, [])
        assertEquals(deserialization, libraryModel)
    })

    await tctx.step(`"dynamify" example library through serialization and deserialization using the Dynamic Model API`, () => {
        const serialization = serializeModel(libraryModel, libraryModelApi)
        const dynamification = deserializeModel(undefinedValuesDeletedFrom(serialization), dynamicModelAPI, libraryMetamodel, [])

        assertEquals(dynamification.length, 2)
        const lookup = nameBasedConceptDeducerFor(libraryMetamodel)
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

