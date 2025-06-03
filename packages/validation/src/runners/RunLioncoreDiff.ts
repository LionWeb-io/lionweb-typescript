import { LionWebJsonChunk } from "@lionweb/json"
import { LionWebJsonDiff } from "@lionweb/json-diff"
import fs from "fs"

const file1 = process.argv[2]
const file2 = process.argv[3]

if (file1 !== null && file1 !== undefined) {
    const jsonString1 = fs.readFileSync(file1, "utf-8")
    const json1 = JSON.parse(jsonString1)
    const jsonString2 = fs.readFileSync(file2, "utf-8")
    const json2 = JSON.parse(jsonString2)

    const lwDiff = new LionWebJsonDiff()
    lwDiff.diffLwChunk(json1 as LionWebJsonChunk, json2 as LionWebJsonChunk)
    if (lwDiff.diffResult.changes.length === 0) {
        console.log("LionWebJsonDiff: equal")
    } else {
        console.log("LionWebJsonDiff: " + lwDiff.diff)
    }
} else {
    console.log("Error in arguments")
}
