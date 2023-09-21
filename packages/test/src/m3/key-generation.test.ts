import {assert} from "chai"
const {deepEqual} = assert

import {builtinPrimitives, LanguageFactory, qualifiedNameBasedKeyGenerator} from "@lionweb/core"
import {hashingIdGen} from "@lionweb/utilities"


describe("key generation", () => {

    it("based on qualified name", () => {
        const factory = new LanguageFactory("FormLanguage", "1", hashingIdGen(), qualifiedNameBasedKeyGenerator("-"))

        const form = factory.concept("Form", false)
        factory.language.havingEntities(form)

        deepEqual(form.key, "FormLanguage-Form")

        const size = factory.property(form, "size").ofType(builtinPrimitives.integerDatatype)
        form.havingFeatures(size)

        deepEqual(size.key, "FormLanguage-Form-size")
    })

})

