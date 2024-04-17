import fs from "fs"
import path from "path"
import {serializeLanguages} from "@lionweb/core"
import {inferLanguagesFromSerializationChunk, readSerializationChunk} from "@lionweb/utilities"


export const inferLanguages = async (filePath: string)=> {
    const dirName = path.dirname(filePath)
    const chunk = await readSerializationChunk(filePath)

    const languages = inferLanguagesFromSerializationChunk(chunk)
    for (const language of languages) {
        const languageFile = path.join(dirName, `${language.name}.language.json`)
        fs.writeFileSync(languageFile, JSON.stringify(serializeLanguages(language), null, 2))
        console.log(`Language ${language.name} has been generated: "${languageFile}"`)
    }
}

