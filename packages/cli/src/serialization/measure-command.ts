import {extname} from "path"
import {Language} from "@lionweb/core"
import {measure, readSerializationChunk, tryReadAllAsLanguages, writeJsonAsFile} from "@lionweb/utilities"
import {separate} from "../language-aware-args.js"

export const executeMeasureCommand = async (args: string[]) => {
    const { chunkPaths, languagePaths } = separate(args)
    const languages = await tryReadAllAsLanguages(languagePaths)
    chunkPaths.forEach(chunkPath => {
        measureSerializationChunk(chunkPath, languages)
    })
}

const measureSerializationChunk = async (path: string, languages: Language[]) => {
    const chunk = await readSerializationChunk(path)
    const extLessPath = path.substring(0, path.length - extname(path).length)
    const metricsPath = extLessPath + ".metrics.json"
    writeJsonAsFile(metricsPath, measure(chunk, languages))
    console.log(`Wrote metrics for ${path} --> ${metricsPath}`)
}

