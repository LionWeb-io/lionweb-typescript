import {extname} from "path"
import {Language} from "@lionweb/core"
import {measure, readChunk, tryLoadAllAsLanguages, writeJsonAsFile} from "@lionweb/utilities"
import {separate} from "../language-aware-args.js"

export const executeMeasureCommand = async (args: string[]) => {
    const { chunkPaths, languagePaths } = separate(args)
    const languages = await tryLoadAllAsLanguages(languagePaths)
    chunkPaths.forEach(chunkPath => {
        measureSerializationChunk(chunkPath, languages)
    })
}

const measureSerializationChunk = async (path: string, languages: Language[]) => {
    const chunk = await readChunk(path)
    const extLessPath = path.substring(0, path.length - extname(path).length)
    const metricsPath = extLessPath + ".metrics.json"
    writeJsonAsFile(metricsPath, measure(chunk, languages))
    console.log(`Wrote metrics for ${path} --> ${metricsPath}`)
}

