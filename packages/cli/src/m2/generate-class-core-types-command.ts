import { exit } from "node:process"
import { generateApiFromLanguages } from "@lionweb/class-core-generator"
import { deserializeLanguages, lionWebVersionFrom, LionWebVersions } from "@lionweb/core"
import { readSerializationChunk } from "@lionweb/utilities"
import { ensurePathSync, tryReadFileAsText } from "../fs-utils.js"

export const headerFlag = "header"
export const notVerboseFlag = "not-verbose"

type ClassCoreTypesGeneratorArguments = {
    chunkPath: string
    genPath: string
    notVerbose: boolean
    headerPath?: string
}

const parseArgs = (args: string[]): ClassCoreTypesGeneratorArguments => {
    const properArgs: string[] = []

    let nextArgIsHeaderPath = false
    let notVerbose = false
    let headerPath: string | undefined
    let multipleHeaderPathsReported = false

    args.forEach((arg) => {
        if (arg === `--${headerFlag}`) {
            nextArgIsHeaderPath = true
        } else if (arg === `--${notVerboseFlag}`) {
            notVerbose = true
        } else {
            if (nextArgIsHeaderPath) {
                if (headerPath !== undefined && !multipleHeaderPathsReported) {
                    console.error(`Multiple header paths given: taking first, and ignoring the rest.`)
                    multipleHeaderPathsReported = true
                } else {
                    headerPath = arg
                    nextArgIsHeaderPath = false
                }
            } else {
                properArgs.push(arg)
            }
        }
    })

    if (properArgs.length !== 2) {
        console.error(`Expected 2 arguments <path_to_chunk> and <path_to_generate_in> but got ${properArgs} instead — exiting.`)
        exit(2)
    }

    return {
        chunkPath: properArgs[0],
        genPath: properArgs[1],
        notVerbose,
        headerPath
    }
}

export const generateClassCoreTypes = async (args: string[]) => {
    const {chunkPath, genPath, headerPath, notVerbose} = parseArgs(args)

    ensurePathSync(genPath)

    const jsonOrError = await readSerializationChunk(chunkPath)
    if (jsonOrError instanceof Error) {
        console.error(`"${chunkPath}" does not point to a valid JSON serialization of a language: ${jsonOrError.message}`)
        return
    }

    const header = headerPath === undefined
        ? undefined
        : await tryReadFileAsText(headerPath)

    const languages = deserializeLanguages(jsonOrError)
    const maybeLionWebVersion = lionWebVersionFrom(jsonOrError.serializationFormatVersion)
    if (maybeLionWebVersion === undefined) {
        console.error(`Couldn’t determine known LionWeb version from serialization chunk with path = ${chunkPath}.`)
        console.log(`(Known LionWeb versions: ${Object.keys(LionWebVersions).join(", ")}.`)
        exit(2)
    }

    generateApiFromLanguages(languages, genPath, maybeLionWebVersion, { header, verbose: !notVerbose })
}

