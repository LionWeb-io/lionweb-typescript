import fs from "fs"
import { LwDiff } from "../diff/LionwebDiff.js"
import { LionWebJsonChunk } from "../json/LionWebJson.js"

const file1 = process.argv[2]
const file2 = process.argv[3]

if (file1 !== null && file1 !== undefined) {
    const jsonString1 = fs.readFileSync(file1, "utf-8")
    const json1 = JSON.parse(jsonString1)
    const jsonString2 = fs.readFileSync(file2, "utf-8")
    const json2 = JSON.parse(jsonString2)

    const lwDiff = new LwDiff()
    lwDiff.diffLwChunk(json1 as LionWebJsonChunk, json2 as LionWebJsonChunk)
    if (lwDiff.errors.length === 0) {
        console.log("LwDiff: equal")
    } else {
        console.log("LwDiff: " + lwDiff.errors)
    }
} else {
    console.log("Error in arguments")
}
