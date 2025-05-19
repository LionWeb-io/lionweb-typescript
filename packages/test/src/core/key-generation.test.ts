import { builtinPrimitives, LanguageFactory } from "@lionweb/core"
import { concatenator } from "@lionweb/ts-utils"

import { equal } from "../test-utils/assertions.js"

describe("key generation", () => {
    it("based on qualified name", () => {
        const factory = new LanguageFactory("FormLanguage", "1", concatenator("-"), concatenator("-"))

        const form = factory.concept("Form", false)

        equal(form.key, "FormLanguage-Form")

        const size = factory.property(form, "size").ofType(builtinPrimitives.integerDatatype)

        equal(size.key, "FormLanguage-Form-size")
    })
})
