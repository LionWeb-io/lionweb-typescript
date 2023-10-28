import {assert} from "chai"
const {deepEqual} = assert

import {builtinPrimitives, chain, concatenator, LanguageFactory} from "@lionweb/core"
import {hasher} from "@lionweb/utilities"


describe("key generation", () => {

    it("based on qualified name", () => {
        const factory = new LanguageFactory(
            "FormLanguage",
            "1",
            chain(concatenator("-"), hasher()),
            concatenator("-")
        )

        const form = factory.concept("Form", false)
        factory.language.havingEntities(form)

        deepEqual(form.key, "FormLanguage-Form")

        const size = factory.property(form, "size").ofType(builtinPrimitives.integerDatatype)
        form.havingFeatures(size)

        deepEqual(size.key, "FormLanguage-Form-size")
    })

})

