import fs from "fs"
import { serializeLanguages } from "@lionweb/core"
import { inferLanguagesFromChunk, readChunk } from "@lionweb/utilities"

export async function inferLanguages(filePath: string) {
    const chunk = await readChunk(filePath)

    const languages = inferLanguagesFromChunk(chunk)
    for (const language of languages) {
        fs.writeFileSync(`${language.name}.json`, JSON.stringify(serializeLanguages(language), null, 2))
    }
}
