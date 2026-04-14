import { readFile } from "fs/promises"
import { existsSync, mkdirSync, statSync } from "fs"

export const tryReadFileAsText = async (path: string): Promise<string | undefined> => {
    try {
        return (await readFile(path)).toString()
    } catch (e) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        console.error(`"${path}" does not point to a readable file: ${(e as any).message}`)
        return undefined
    }
}

export const ensurePathSync = (path: string) => {
    if (!(existsSync(path) && statSync(path).isDirectory())) {
        mkdirSync(path)
    }
}

