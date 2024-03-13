import fs from "fs"
import path from "path"
import { serializeLanguages } from "@lionweb/core"
import { inferLanguagesFromChunk, readSerializationChunk } from "@lionweb/utilities"

export async function inferLanguages(filePath: string) {
    const dirName = path.dirname(filePath)
    const chunk = await readSerializationChunk(filePath)

    const languages = inferLanguagesFromChunk(chunk)
    for (const language of languages) {
        const languageFile = path.join(dirName, `${language.name}-Language.json`)
        fs.writeFileSync(languageFile, JSON.stringify(serializeLanguages(language), null, 2))
        console.log(`Language ${language.name} has been generated: "${languageFile}"`)
    }
}
