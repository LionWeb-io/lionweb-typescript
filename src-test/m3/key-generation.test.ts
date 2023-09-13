import {assert} from "chai"
const {deepEqual} = assert

import {builtinPrimitives, LanguageFactory, qualifiedNameBasedKeyGenerator} from "../../src-pkg/index.js"
import {hashingIdGen} from "../../src-utils/id-generation.js"


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

