import { serializeLanguages } from "@lionweb/core"
import { asPrettyJsonString } from "@lionweb/ts-utils"
import { inferLanguagesFromSerializationChunk, readSerializationChunk } from "@lionweb/utilities"
import { writeFileSync } from "fs"
import path from "path"

export const inferLanguages = async (filePath: string) => {
    const dirName = path.dirname(filePath)
    const chunk = await readSerializationChunk(filePath)

    const languages = inferLanguagesFromSerializationChunk(chunk)
    for (const language of languages) {
        const languageFile = path.join(dirName, `${language.name}.language.json`)
        writeFileSync(languageFile, asPrettyJsonString(serializeLanguages(language)))
        console.log(`Language ${language.name} has been generated: "${languageFile}"`)
    }
}
