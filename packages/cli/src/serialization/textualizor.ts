import {writeFile} from "fs/promises"
import {extname} from "path"
import {genericAsTreeText, readChunk} from "@lionweb/utilities"


export const textualizeSerializationChunk = async (path: string) => {
    const chunk = await readChunk(path)
    const extLessPath = path.substring(0, path.length - extname(path).length)
    await writeFile(extLessPath + ".txt", genericAsTreeText(chunk))
    console.log(`textualized: ${path}`)
}

