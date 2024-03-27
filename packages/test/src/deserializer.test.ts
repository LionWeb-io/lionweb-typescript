import {assert} from "chai"
const {deepEqual} = assert

import {currentSerializationFormatVersion, deserializeSerializationChunk, SerializationChunk} from "@lionweb/core"
import {libraryInstantiationFacade} from "./instances/library.js"
import {libraryLanguage} from "./languages/library.js"


describe("deserialization", () => {

    it("deserializes all nodes, also when there are effectively no root nodes", () => {
        const serializationChunk: SerializationChunk = {
            serializationFormatVersion: currentSerializationFormatVersion,
            "languages": [
                {
                    "key": "library",
                    "version": "1"
                }
            ],
            nodes: [
                {
                    id: "1",
                    classifier: {
                        language: "library",
                        version: "1",
                        key: "Library"
                    },
                    properties: [],
                    containments: [],
                    references: [],
                    annotations: [],
                    parent: "parent-not-resolvable"
                }
            ]
        }
        const deserialization = deserializeSerializationChunk(serializationChunk, libraryInstantiationFacade, [libraryLanguage], [])
        deepEqual(
            deserialization,
            [
                {
                    id: "1",
                    classifier: "Library",
                    annotations: []
                }   // is instantiated despite its serialization specifying a non-null parent ID that's not resolvable within the serialization chunk
            ]
        )
    })

})

