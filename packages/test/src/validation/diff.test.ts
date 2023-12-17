import { LionWebJsonChunk, LionWebJsonDiff } from "@lionweb/validation"
import { assert } from "chai"
import fs from "fs"

const { deepEqual } = assert

function readModel(filename: string): LionWebJsonChunk | null {
    if (fs.existsSync(filename)) {
        const stats = fs.statSync(filename)
        if (stats.isFile()) {
            const chunk: LionWebJsonChunk = JSON.parse(fs.readFileSync(filename).toString())
            return chunk
        }
    }
    return null
}

describe("Library test model", () => {
    it("[de-]serialize example library", async () => {
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

        // const diff = new LionWebJsonDiff()
        // diff.diffLwChunk(jsonModel, jsonModel2)
        // console.log(" JsonModel : \n" + new LionWebJsonChunkWrapper(jsonModel).asString())
        // console.log(" JsonModel2: \n" + new LionWebJsonChunkWrapper(jsonModel2).asString())
        // console.log(diff.diffResult.changes.map(ch => ch.changeMsg()))
        // //  errors expected
        // deepEqual(diff.diffResult.changes.length, 12)
    })
})
