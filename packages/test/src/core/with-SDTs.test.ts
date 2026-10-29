import { deserializeLanguagesFrom, LionWebVersions, serializeLanguagesFor, StructuredDataType } from "@lionweb/core"

import { languageWithSDTs } from "../languages/with-SDTs.js"
import { deepEqual, isTrue } from "../test-utils/assertions.js"

describe("Language-with-SDTs", () => {

    it("roundtrip persistence of M2", () => {
        const serialization = serializeLanguagesFor({ lionWebVersion: LionWebVersions.v2024_1, languages: [languageWithSDTs] })
        const deserialization = deserializeLanguagesFrom({ lionWebVersion: LionWebVersions.v2024_1, serializationChunk: serialization })
        deepEqual(deserialization.length, 1)
        deepEqual(deserialization[0], languageWithSDTs)
        const language = deserialization[0]
        const entity1 = language.entities[1]
        isTrue(entity1 instanceof StructuredDataType)
        const sdt1 = entity1 as StructuredDataType
        deepEqual(sdt1.name, "Amount")
        deepEqual(sdt1.fields.length, 3)
        const field1 = sdt1.fields[0]
        deepEqual(field1.name, "value")
        deepEqual(field1.type, LionWebVersions.v2024_1.builtinsFacade.primitiveTypes.integerDataType)
    })

})

