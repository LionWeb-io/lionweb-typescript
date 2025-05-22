import { LionWebJsonChunk } from "@lionweb/json"
import { LionWebJsonDiff } from "@lionweb/json-diff"
import { existsSync, readFileSync, statSync } from "fs"

import { deepEqual } from "../test-utils/assertions.js"

function readModel(filename: string): LionWebJsonChunk | null {
    if (existsSync(filename)) {
        const stats = statSync(filename)
        if (stats.isFile()) {
            const chunk: LionWebJsonChunk = JSON.parse(readFileSync(filename).toString())
            return chunk
        }
    }
    return null
}

describe("FileSystem mode test", () => {
    it("compare JSON models", async () => {
        const jsonModel = readModel("./src/validation/Disk_1.json")
        const jsonModel2 = readModel("./src/validation/Disk_2.json")

        if (jsonModel === null || jsonModel2 === null) {
            console.error("Cannot read model files")
            return
        }
        const diff1 = new LionWebJsonDiff()
        diff1.diffLwChunk(jsonModel, jsonModel)
        // No errors expected
        deepEqual(diff1.diffResult.changes, [])
    })
})
